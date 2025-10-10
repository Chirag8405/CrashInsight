#!/usr/bin/env python3
import os
import pandas as pd
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier, export_text, export_graphviz
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import graphviz
import base64
from io import StringIO
from mlxtend.frequent_patterns import apriori, association_rules  
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

# Production CORS configuration
if os.getenv('FLASK_ENV') == 'production':
    # Add your Netlify domain here
    CORS(app, origins=["https://*.netlify.app", "https://crashinsight.netlify.app"])
else:
    CORS(app)  # Allow all origins in development

@app.after_request
def after_request(response):
    if os.getenv('FLASK_ENV') != 'production':
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

class TrafficAccidentAnalyzer:
    def __init__(self, csv_file=None):
        self.df = None
        self.processed_df = None
        # Try multiple paths for the dataset
        if csv_file is None:
            possible_paths = [
                'traffic_accidents.csv',
                './traffic_accidents.csv',
                os.path.join(os.path.dirname(__file__), 'traffic_accidents.csv'),
                os.getenv('DATASET_PATH', 'traffic_accidents.csv')
            ]
            csv_file = None
            for path in possible_paths:
                if os.path.exists(path):
                    csv_file = path
                    break
            
            if csv_file is None:
                raise FileNotFoundError("Dataset file not found. Please ensure traffic_accidents.csv is available.")
        
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
        # Select key features for more balanced clustering
        important_encoded_cols = [col for col in self.processed_df.columns if any(key in col for key in [
            'weather_condition_encoded', 'lighting_condition_encoded', 'first_crash_type_encoded',
            'traffic_control_device_encoded', 'roadway_surface_cond_encoded'
        ])]
        
        # Add temporal and injury features (note: data appears to have hour periods 1-7, days 1-12)
        feature_cols = important_encoded_cols + ['crash_hour', 'crash_day_of_week', 'crash_month', 'injuries_total']
        
        # Remove rows with NaN values in feature columns
        cluster_df = self.processed_df[feature_cols].dropna()
        
        print(f"Clustering with features: {feature_cols}")
        print(f"Data shape for clustering: {cluster_df.shape}")
        
        
        # Sample data if too large to ensure diverse patterns
        if len(cluster_df) > 50000:
            cluster_df = cluster_df.sample(n=50000, random_state=42)
        
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(cluster_df)
        
        # Perform K-means clustering with multiple initializations
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=20, max_iter=500)
        clusters = kmeans.fit_predict(X_scaled)
        
        # Enhanced cluster analysis with more insights
        cluster_df['cluster'] = clusters
        cluster_analysis = {}
        total_accidents = len(cluster_df)
        
        for i in range(n_clusters):
            cluster_data = cluster_df[cluster_df['cluster'] == i]
            
            # Calculate injury severity distribution
            injury_dist = {
                'no_injury': len(cluster_data[cluster_data['injuries_total'] == 0]),
                'minor': len(cluster_data[(cluster_data['injuries_total'] > 0) & (cluster_data['injuries_total'] <= 2)]),
                'serious': len(cluster_data[cluster_data['injuries_total'] > 2])
            }
            
            # Find most common accident characteristics - get actual mode for THIS cluster
            cluster_hour_mode = cluster_data['crash_hour'].mode()
            cluster_day_mode = cluster_data['crash_day_of_week'].mode()
            cluster_month_mode = cluster_data['crash_month'].mode()
            
            # Get more diverse time patterns by checking distribution
            hour_dist = cluster_data['crash_hour'].value_counts()
            day_dist = cluster_data['crash_day_of_week'].value_counts()
            
            # Map 24-hour time to specific time ranges
            def get_time_range(hour):
                if hour == 0:
                    return "12:00 AM - 1:00 AM (Midnight)"
                elif hour < 12:
                    return f"{hour}:00 AM - {hour + 1}:00 AM"
                elif hour == 12:
                    return "12:00 PM - 1:00 PM (Noon)"
                else:
                    return f"{hour - 12}:00 PM - {hour - 11}:00 PM"
            
            # The 'day_of_week' column might actually be months (1-12) based on data analysis
            month_map = {1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
                        7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'}
            
            
            primary_hour = int(cluster_hour_mode.iloc[0]) if len(cluster_hour_mode) > 0 else int(hour_dist.index[0])
            primary_period = int(cluster_day_mode.iloc[0]) if len(cluster_day_mode) > 0 else int(day_dist.index[0])
            
            cluster_analysis[f'cluster_{i}'] = {
                'size': len(cluster_data),
                'percentage': round((len(cluster_data) / total_accidents) * 100, 1),
                'avg_injuries': round(float(cluster_data['injuries_total'].mean()), 2),
                'injury_distribution': injury_dist,
                'common_hour': primary_hour,
                'common_day': primary_period,  # This might actually be month
                'common_month': int(cluster_month_mode.iloc[0]) if len(cluster_month_mode) > 0 else 1,
                'risk_level': 'High' if cluster_data['injuries_total'].mean() > 0.6 else 'Medium' if cluster_data['injuries_total'].mean() > 0.3 else 'Low',
                'cluster_label': f"Cluster {i}",
                'hour_description': get_time_range(primary_hour),
                'period_description': month_map.get(primary_period, f'Period {primary_period}'),
                # Add additional insights for debugging
                'hour_distribution': hour_dist.head(3).to_dict(),
                'day_distribution': day_dist.to_dict()
            }
        
        # Calculate clustering quality metrics
        inertia = kmeans.inertia_
        
        return {
            'algorithm': 'K-Means',
            'n_clusters': n_clusters,
            'total_accidents': total_accidents,
            'inertia': float(inertia),
            'cluster_analysis': cluster_analysis,
            'cluster_centers': kmeans.cluster_centers_.tolist(),
            'feature_names': feature_cols,
            'silhouette_info': 'Available upon request'  # Could add silhouette analysis
        }
    
    def _safe_export_text(self, model, feature_names, max_depth=15):
        """Safely export decision tree text with error handling"""
        try:
            return export_text(model, feature_names=feature_names, max_depth=max_depth)
        except Exception as e:
            print(f"Error exporting tree text: {e}")
            return f"Error generating tree structure: {str(e)}"
    
    def generate_graphviz_tree(self, model, feature_names, class_names):
        """Generate a perfectly aligned decision tree using graphviz"""
        try:
            # Create cleaner feature names for display (without emojis)
            clean_feature_names = []
            for name in feature_names:
                if 'first_crash_type' in name:
                    clean_name = 'Collision Type\n(1-7: Minor, 8+: Severe)'
                elif 'num_units' in name:
                    clean_name = 'Vehicle Count\n(Multi-vehicle risk)'
                elif 'prim_contributory_cause' in name:
                    clean_name = 'Primary Cause\n(Driver/Road/Weather)'
                elif 'weather_condition' in name:
                    clean_name = 'Weather Condition\n(Clear/Rain/Snow)'
                elif 'lighting_condition' in name:
                    clean_name = 'Lighting Condition\n(Day/Night/Dawn)'
                elif 'traffic_control_device' in name:
                    clean_name = 'Traffic Control\n(Signal/Sign/None)'
                elif 'crash_hour' in name:
                    clean_name = 'Hour of Day\n(Rush vs Off-peak)'
                elif 'crash_day_of_week' in name:
                    clean_name = 'Day of Week\n(Weekday vs Weekend)'
                else:
                    clean_name = (name.replace('_encoded', '')
                                .replace('_', ' ').title())
                clean_feature_names.append(clean_name)
            
            # Create cleaner class names based on actual severity categories (without emojis)
            clean_class_names = []
            for class_name in class_names:
                if str(class_name) == 'Fatal':
                    clean_class_names.append('FATAL\nAccident\n(Life Lost)')
                elif str(class_name) == 'Serious Injury':
                    clean_class_names.append('SERIOUS\nInjury\n(Incapacitating)')
                elif str(class_name) == 'Minor Injury':
                    clean_class_names.append('MINOR\nInjury\n(Non-incapacitating)')
                elif str(class_name) == 'No Injury':
                    clean_class_names.append('NO INJURY\nProperty\nDamage Only')
                else:
                    clean_class_names.append(f'{class_name}\nSeverity\nLevel')
            
            # Export tree to DOT format - Optimized for readability and size
            dot_data = export_graphviz(
                model,
                out_file=None,
                feature_names=clean_feature_names,
                class_names=clean_class_names,
                filled=True,
                rounded=True,
                special_characters=True,
                proportion=False,  # Simplified node content
                precision=2,  # Reduced precision for cleaner display
                max_depth=6,  # Match model depth
                impurity=False,  # Remove gini for cleaner nodes
                leaves_parallel=False,  # More compact layout
                rotate=False  # Top-down layout
            )
            
            # Create graphviz object and render to SVG
            graph = graphviz.Source(dot_data, format='svg')
            svg_data = graph.pipe(format='svg').decode('utf-8')
            
            # Encode SVG as base64 for easy transport
            svg_base64 = base64.b64encode(svg_data.encode('utf-8')).decode('utf-8')
            
            return {
                'svg_data': svg_data,
                'svg_base64': svg_base64,
                'dot_source': dot_data
            }
            
        except Exception as e:
            print(f"Error generating graphviz tree: {e}")
            return {
                'error': f"Failed to generate graphviz tree: {str(e)}",
                'svg_data': None,
                'svg_base64': None,
                'dot_source': None
            }
    
    def train_severity_model(self):
        """Train both Random Forest and Decision Tree models to predict crash severity"""
        # Prepare features - exclude injury-related features to avoid circular dependency
        feature_cols = [col for col in self.processed_df.columns if col.endswith('_encoded')]
        
        # Remove injury-related features to predict severity from conditions, not outcomes
        injury_related = ['most_severe_injury_encoded', 'injuries_total_encoded', 'injuries_fatal_encoded', 
                         'injuries_incapacitating_encoded', 'injuries_non_incapacitating_encoded', 
                         'injuries_reported_not_evident_encoded', 'injuries_no_indication_encoded']
        feature_cols = [col for col in feature_cols if col not in injury_related]
        
        # Add temporal and count features
        feature_cols.extend(['crash_hour', 'crash_day_of_week', 'crash_month', 'num_units'])
        
        # Remove rows with NaN values
        model_df = self.processed_df[feature_cols + ['severity']].dropna()
        
        X = model_df[feature_cols]
        y = model_df['severity']
        
        # Split data with stratification to maintain class balance
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Train Random Forest with class balancing
        rf_model = RandomForestClassifier(
            n_estimators=100, 
            random_state=42, 
            max_depth=10,
            class_weight='balanced'  # Automatically balance classes
        )
        rf_model.fit(X_train, y_train)
        rf_pred = rf_model.predict(X_test)
        rf_accuracy = accuracy_score(y_test, rf_pred)
        rf_cm = confusion_matrix(y_test, rf_pred)
        
        # Train Decision Tree - Sweet spot: moderate size with all classes
        dt_model = DecisionTreeClassifier(
            random_state=42, 
            max_depth=7,  # Moderate depth 
            min_samples_split=50,  # Balanced splitting threshold
            min_samples_leaf=30,   # Moderate leaf size
            min_impurity_decrease=0.005,  # Moderate sensitivity
            max_leaf_nodes=20,  # Allow reasonable complexity
            class_weight='balanced'  # Essential for minority classes
        )
        dt_model.fit(X_train, y_train)
        dt_pred = dt_model.predict(X_test)
        dt_accuracy = accuracy_score(y_test, dt_pred)
        dt_cm = confusion_matrix(y_test, dt_pred)
        
        # Get feature importance for both models
        rf_feature_importance = dict(zip(feature_cols, rf_model.feature_importances_))
        dt_feature_importance = dict(zip(feature_cols, dt_model.feature_importances_))
        
        # Filter for accident-relevant features (exclude injury outcomes - we want causal factors)
        accident_relevant_features = [f for f in feature_cols if not any(injury_term in f for injury_term in 
                                    ['most_severe_injury', 'injuries_total', 'injuries_fatal', 'injuries_incapacitating', 
                                     'injuries_non_incapacitating', 'injuries_reported_not_evident', 'injuries_no_indication'])]
        rf_accident_features = {k: v for k, v in rf_feature_importance.items() if k in accident_relevant_features}
        rf_accident_features = dict(sorted(rf_accident_features.items(), key=lambda x: x[1], reverse=True))
        
        # Get unique class labels for confusion matrix interpretation
        class_labels = list(set(y_test.unique()) | set(rf_pred) | set(dt_pred))
        class_labels.sort()
        
        # Calculate precision, recall, f1-score for both models
        rf_report = classification_report(y_test, rf_pred, output_dict=True)
        dt_report = classification_report(y_test, dt_pred, output_dict=True)
        
        # Generate decision tree structure for visualization
        try:
            dt_tree_rules = export_text(dt_model, feature_names=feature_cols, max_depth=6)
        except Exception as e:
            print(f"Error generating decision tree rules: {e}")
            dt_tree_rules = "Error: Could not generate decision tree structure"
        
        # Generate graphviz visualization for perfect tree alignment
        graphviz_tree = self.generate_graphviz_tree(dt_model, feature_cols, class_labels)
        
        # Get Random Forest structure info
        rf_n_estimators = rf_model.n_estimators
        rf_max_depth = rf_model.max_depth
        
        return {
            'random_forest': {
                'accuracy': float(rf_accuracy),
                'feature_importance': {k: float(v) for k, v in rf_feature_importance.items()},
                'confusion_matrix': rf_cm.tolist(),
                'classification_report': rf_report
            },
            'decision_tree': {
                'accuracy': float(dt_accuracy),
                'feature_importance': {k: float(v) for k, v in dt_feature_importance.items()},
                'confusion_matrix': dt_cm.tolist(),
                'classification_report': dt_report
            },
            'class_labels': class_labels,
            'test_size': len(y_test),
            'model_comparison': {
                'rf_accuracy': float(rf_accuracy),
                'dt_accuracy': float(dt_accuracy),
                'better_model': 'Random Forest' if rf_accuracy > dt_accuracy else 'Decision Tree',
                'accuracy_difference': float(abs(rf_accuracy - dt_accuracy))
            },
            'model_structures': {
                'decision_tree_rules': dt_tree_rules,
                'decision_tree_full': self._safe_export_text(dt_model, feature_cols, max_depth=15),  # Full tree for modal
                'decision_tree_graphviz': graphviz_tree,  # Perfect graphviz tree visualization
                'random_forest_info': {
                    'n_estimators': rf_n_estimators,
                    'max_depth': rf_max_depth,
                    'feature_count': len(feature_cols),
                    'top_features': list(rf_accident_features.items())[:8],  # Top accident-relevant features
                    'all_features': list(rf_feature_importance.items())[:15]  # All features for modal
                }
            }
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

# Initialize analyzer
try:
    analyzer = TrafficAccidentAnalyzer()
    print(f"Dataset loaded successfully with {len(analyzer.df)} records")
except Exception as e:
    print(f"Error loading dataset: {e}")
    analyzer = None

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') != 'production'
    
    print("Starting Traffic Accident Analysis API...")
    if analyzer:
        print(f"Dataset loaded with {len(analyzer.df)} records")
    else:
        print("Warning: Dataset not loaded properly")
    
    app.run(debug=debug, host='0.0.0.0', port=port)