#!/usr/bin/env python3
import pandas as pd
import numpy as np
from flask import Flask, jsonify, request
# from flask_cors import CORS
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from mlxtend.frequent_patterns import apriori, association_rules
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
# CORS(app)  # Commented out - will handle CORS manually if needed

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

class TrafficAccidentAnalyzer:
    def __init__(self, csv_file='traffic_accidents.csv'):
        self.df = None
        self.processed_df = None
        self.load_and_process_data(csv_file)
        
    def load_and_process_data(self, csv_file):
        """Load and preprocess the traffic accident data"""
        # Define column names based on analysis
        column_names = [
            'crash_time', 'traffic_control_device', 'weather_condition', 
            'lighting_condition', 'first_crash_type', 'trafficway_type',
            'alignment', 'roadway_surface_cond', 'road_defect', 'crash_type',
            'intersection_related_i', 'damage', 'prim_contributory_cause',
            'num_units', 'most_severe_injury', 'injuries_total', 'injuries_fatal',
            'injuries_incapacitating', 'injuries_non_incapacitating', 'injuries_reported_not_evident',
            'injuries_no_indication', 'crash_hour', 'crash_day_of_week', 'crash_month'
        ]
        
        self.df = pd.read_csv(csv_file, header=None, names=column_names)
        
        # Clean and preprocess data
        self.processed_df = self.df.copy()
        
        # Convert crash_time to datetime if it contains date
        try:
            # Try to parse if it's a full datetime
            self.processed_df['crash_datetime'] = pd.to_datetime(self.processed_df['crash_time'])
        except:
            # If it's just time, use crash_hour as hour
            self.processed_df['crash_datetime'] = None
            
        # Convert numeric columns
        numeric_cols = ['injuries_total', 'injuries_fatal', 'injuries_incapacitating', 
                       'injuries_non_incapacitating', 'injuries_reported_not_evident', 
                       'injuries_no_indication', 'crash_hour', 'crash_day_of_week', 'crash_month']
        
        for col in numeric_cols:
            self.processed_df[col] = pd.to_numeric(self.processed_df[col], errors='coerce')
            
        # Fill missing values
        self.processed_df.fillna('Unknown', inplace=True)
        
        # Create severity categories
        self.processed_df['severity'] = self.processed_df.apply(self._categorize_severity, axis=1)
        
        # Encode categorical variables for ML
        self.label_encoders = {}
        self.categorical_cols = ['traffic_control_device', 'weather_condition', 'lighting_condition',
                               'first_crash_type', 'trafficway_type', 'alignment', 'roadway_surface_cond',
                               'road_defect', 'prim_contributory_cause', 'most_severe_injury']
        
        for col in self.categorical_cols:
            self.label_encoders[col] = LabelEncoder()
            self.processed_df[f'{col}_encoded'] = self.label_encoders[col].fit_transform(self.processed_df[col].astype(str))
    
    def _categorize_severity(self, row):
        """Categorize crash severity based on injury data"""
        if row['injuries_fatal'] > 0:
            return 'Fatal'
        elif row['injuries_incapacitating'] > 0:
            return 'Serious Injury'
        elif row['injuries_non_incapacitating'] > 0:
            return 'Minor Injury'
        else:
            return 'No Injury'
    
    def get_basic_stats(self):
        """Get basic statistics about the dataset"""
        return {
            'total_accidents': len(self.df),
            'fatal_accidents': len(self.df[self.df['injuries_fatal'] > 0]),
            'injury_accidents': len(self.df[self.df['injuries_total'] > 0]),
            'property_damage_only': len(self.df[self.df['injuries_total'] == 0]),
            'avg_injuries_per_accident': float(self.df['injuries_total'].mean()),
            'most_common_crash_type': self.df['first_crash_type'].mode()[0],
            'most_common_weather': self.df['weather_condition'].mode()[0],
            'most_common_lighting': self.df['lighting_condition'].mode()[0]
        }
    
    def get_time_analysis(self):
        """Analyze crashes by time patterns"""
        hour_counts = self.processed_df['crash_hour'].value_counts().sort_index()
        day_counts = self.processed_df['crash_day_of_week'].value_counts().sort_index()
        month_counts = self.processed_df['crash_month'].value_counts().sort_index()
        
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        return {
            'hourly_distribution': [
                {'hour': int(hour), 'accidents': int(count)} 
                for hour, count in hour_counts.items() if not pd.isna(hour)
            ],
            'daily_distribution': [
                {'day': day_names[int(day)-1] if not pd.isna(day) and day < 8 else f'Day {int(day)}', 
                 'accidents': int(count)}
                for day, count in day_counts.items() if not pd.isna(day)
            ],
            'monthly_distribution': [
                {'month': month_names[int(month)-1] if not pd.isna(month) and 1 <= month <= 12 else f'Month {int(month)}',
                 'accidents': int(count)}
                for month, count in month_counts.items() if not pd.isna(month)
            ]
        }
    
    def get_severity_analysis(self):
        """Analyze accident severity patterns"""
        severity_counts = self.processed_df['severity'].value_counts()
        
        # Severity by weather
        weather_severity = self.processed_df.groupby(['weather_condition', 'severity']).size().unstack(fill_value=0)
        
        # Severity by lighting
        lighting_severity = self.processed_df.groupby(['lighting_condition', 'severity']).size().unstack(fill_value=0)
        
        return {
            'severity_distribution': [
                {'severity': severity, 'count': int(count)}
                for severity, count in severity_counts.items()
            ],
            'severity_by_weather': {
                weather: {severity: int(count) for severity, count in row.items()}
                for weather, row in weather_severity.iterrows()
            },
            'severity_by_lighting': {
                lighting: {severity: int(count) for severity, count in row.items()}
                for lighting, row in lighting_severity.iterrows()
            }
        }
    
    def get_location_analysis(self):
        """Analyze crashes by location characteristics"""
        traffic_control = self.df['traffic_control_device'].value_counts().head(10)
        road_surface = self.df['roadway_surface_cond'].value_counts().head(10)
        trafficway = self.df['trafficway_type'].value_counts().head(10)
        
        return {
            'traffic_control_distribution': [
                {'type': str(device), 'count': int(count)}
                for device, count in traffic_control.items()
            ],
            'road_surface_distribution': [
                {'condition': str(condition), 'count': int(count)}
                for condition, count in road_surface.items()
            ],
            'trafficway_distribution': [
                {'type': str(tway), 'count': int(count)}
                for tway, count in trafficway.items()
            ]
        }
    
    def perform_clustering(self, n_clusters=5):
        """Perform K-means clustering on accident data"""
        # Select features for clustering
        feature_cols = [col for col in self.processed_df.columns if col.endswith('_encoded')]
        feature_cols.extend(['crash_hour', 'crash_day_of_week', 'crash_month', 'injuries_total'])
        
        # Remove rows with NaN values in feature columns
        cluster_df = self.processed_df[feature_cols].dropna()
        
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(cluster_df)
        
        # Perform K-means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(X_scaled)
        
        # Analyze clusters
        cluster_df['cluster'] = clusters
        cluster_analysis = {}
        
        for i in range(n_clusters):
            cluster_data = cluster_df[cluster_df['cluster'] == i]
            cluster_analysis[f'cluster_{i}'] = {
                'size': len(cluster_data),
                'avg_injuries': float(cluster_data['injuries_total'].mean()),
                'common_hour': int(cluster_data['crash_hour'].mode()[0]) if not cluster_data['crash_hour'].mode().empty else 0,
                'common_day': int(cluster_data['crash_day_of_week'].mode()[0]) if not cluster_data['crash_day_of_week'].mode().empty else 0
            }
        
        return {
            'n_clusters': n_clusters,
            'cluster_analysis': cluster_analysis,
            'cluster_centers': kmeans.cluster_centers_.tolist()
        }
    
    def train_severity_model(self):
        """Train a model to predict crash severity"""
        # Prepare features
        feature_cols = [col for col in self.processed_df.columns if col.endswith('_encoded')]
        feature_cols.extend(['crash_hour', 'crash_day_of_week', 'crash_month', 'num_units'])
        
        # Remove rows with NaN values
        model_df = self.processed_df[feature_cols + ['severity']].dropna()
        
        X = model_df[feature_cols]
        y = model_df['severity']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Feature importance
        feature_importance = dict(zip(feature_cols, model.feature_importances_))
        
        return {
            'accuracy': float(accuracy),
            'feature_importance': {k: float(v) for k, v in feature_importance.items()},
            'model_performance': classification_report(y_test, y_pred, output_dict=True)
        }
    
    def generate_association_rules(self, min_support=0.01):
        """Generate association rules for crash factors - filtered for accident relevance"""
        # Create binary matrix for association rule mining
        # Focus on factors that directly relate to accidents
        binary_cols = ['weather_condition', 'lighting_condition', 'first_crash_type', 
                      'traffic_control_device', 'roadway_surface_cond']
        
        # Add severity and injury indicators for accident-relevant rules
        severity_df = pd.DataFrame()
        
        # Create injury severity categories
        severity_df['high_injury'] = (self.df['injuries_total'] >= 2).astype(int)
        severity_df['fatal_accident'] = (self.df['injuries_fatal'] > 0).astype(int)
        severity_df['multiple_vehicles'] = (self.df['num_units'] > 1).astype(int)
        
        # Create binary encoding for conditions
        binary_df = pd.DataFrame()
        for col in binary_cols:
            dummies = pd.get_dummies(self.df[col], prefix=col)
            # Keep only most frequent categories to avoid too many rules
            top_categories = dummies.sum().nlargest(4).index  # Reduced to 4 to focus on main patterns
            binary_df = pd.concat([binary_df, dummies[top_categories]], axis=1)
        
        # Add severity indicators
        binary_df = pd.concat([binary_df, severity_df], axis=1)
        
        # Generate frequent itemsets
        try:
            frequent_itemsets = apriori(binary_df, min_support=min_support, use_colnames=True)
            
            if len(frequent_itemsets) > 0:
                # Generate rules
                rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.6)
                
                if len(rules) > 0:
                    rules_list = []
                    
                    # Define obvious/common-sense rules to filter out
                    obvious_patterns = [
                        ('weather_condition_CLEAR', 'lighting_condition_DAYLIGHT'),
                        ('lighting_condition_DAYLIGHT', 'weather_condition_CLEAR'),
                        ('weather_condition_RAIN', 'roadway_surface_cond_WET'),
                        ('roadway_surface_cond_WET', 'weather_condition_RAIN'),
                        ('weather_condition_SNOW', 'roadway_surface_cond_SNOW OR SLUSH'),
                        ('roadway_surface_cond_SNOW OR SLUSH', 'weather_condition_SNOW'),
                        ('lighting_condition_DARKNESS', 'lighting_condition_LIGHTED'),
                    ]
                    
                    for _, rule in rules.iterrows():
                        # Filter for accident-relevant rules
                        antecedents = list(rule['antecedents'])
                        consequents = list(rule['consequents'])
                        
                        # Check if this is an obvious correlation
                        is_obvious = False
                        for ant in antecedents:
                            for cons in consequents:
                                if (ant, cons) in obvious_patterns or (cons, ant) in obvious_patterns:
                                    is_obvious = True
                                    break
                                # Also filter any rule where weather/surface conditions predict each other
                                if ('weather_condition' in ant and 'roadway_surface_cond' in cons) or \
                                   ('roadway_surface_cond' in ant and 'weather_condition' in cons):
                                    is_obvious = True
                                    break
                            if is_obvious:
                                break
                        
                        # Only include rules that predict accident outcomes (injuries, fatalities, crash types)
                        has_accident_outcome = any(
                            keyword in ' '.join(consequents) 
                            for keyword in ['high_injury', 'fatal_accident', 'multiple_vehicles', 'first_crash_type']
                        )
                        
                        # Exclude rules that predict weather or lighting conditions (these are environmental, not outcomes)
                        predicts_environment = any(
                            keyword in ' '.join(consequents)
                            for keyword in ['weather_condition', 'lighting_condition', 'roadway_surface_cond']
                        )
                        
                        # Include only meaningful accident prediction rules:
                        # - Must predict accident outcomes (injuries, crash types, fatalities)
                        # - Must not predict environmental conditions (weather, lighting, road surface)
                        # - Must not be obvious correlations (snow → snow surface, etc.)
                        # - Must have meaningful lift (> 1.1x more likely than random)
                        if not is_obvious and has_accident_outcome and not predicts_environment and rule['lift'] > 1.1:
                            rules_list.append({
                                'antecedents': antecedents,
                                'consequents': consequents,
                                'support': float(rule['support']),
                                'confidence': float(rule['confidence']),
                                'lift': float(rule['lift'])
                            })
                    
                    # Sort by lift (most interesting patterns first)
                    rules_list.sort(key=lambda x: x['lift'], reverse=True)
                    return {'rules': rules_list[:15]}  # Return top 15 most interesting rules
            
        except Exception as e:
            print(f"Association rule mining error: {e}")
        
        return {'rules': [], 'error': 'No significant association rules found'}

# Initialize analyzer
analyzer = TrafficAccidentAnalyzer()

@app.route('/api/stats', methods=['GET'])
def get_basic_stats():
    """Get basic statistics about accidents"""
    return jsonify(analyzer.get_basic_stats())

@app.route('/api/time-analysis', methods=['GET'])
def get_time_analysis():
    """Get time-based analysis"""
    return jsonify(analyzer.get_time_analysis())

@app.route('/api/severity-analysis', methods=['GET'])
def get_severity_analysis():
    """Get severity analysis"""
    return jsonify(analyzer.get_severity_analysis())

@app.route('/api/location-analysis', methods=['GET'])
def get_location_analysis():
    """Get location-based analysis"""
    return jsonify(analyzer.get_location_analysis())

@app.route('/api/clustering', methods=['GET'])
def perform_clustering():
    """Perform clustering analysis"""
    n_clusters = request.args.get('clusters', 5, type=int)
    return jsonify(analyzer.perform_clustering(n_clusters))

@app.route('/api/ml-model', methods=['GET'])
def train_model():
    """Train and evaluate ML model"""
    return jsonify(analyzer.train_severity_model())

@app.route('/api/association-rules', methods=['GET'])
def get_association_rules():
    """Generate association rules"""
    min_support = request.args.get('min_support', 0.01, type=float)
    return jsonify(analyzer.generate_association_rules(min_support))

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'data_loaded': analyzer.df is not None,
        'total_records': len(analyzer.df) if analyzer.df is not None else 0
    })

if __name__ == '__main__':
    print("Starting Traffic Accident Analysis API...")
    print(f"Dataset loaded with {len(analyzer.df)} records")
    app.run(debug=True, host='0.0.0.0', port=5000)