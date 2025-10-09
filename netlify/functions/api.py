import json
import os
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from mlxtend.frequent_patterns import apriori, association_rules
import warnings
warnings.filterwarnings('ignore')

class TrafficAccidentAnalyzer:
    def __init__(self, csv_file=None):
        self.df = None
        self.processed_df = None
        # Try multiple paths for the dataset in Netlify environment
        if csv_file is None:
            possible_paths = [
                '/opt/build/repo/traffic_accidents.csv',  # Netlify build path
                '../../traffic_accidents.csv',
                '../traffic_accidents.csv', 
                './traffic_accidents.csv',
                os.path.join(os.path.dirname(__file__), '../../traffic_accidents.csv')
            ]
            csv_file = None
            for path in possible_paths:
                if os.path.exists(path):
                    csv_file = path
                    break
            
            if csv_file is None:
                # Use sample data if dataset not found
                print("Dataset not found, using sample data")
                self.create_sample_data()
                return
        
        self.load_and_process_data(csv_file)
        
    def load_and_process_data(self, csv_file):
        """Load and preprocess the traffic accident data"""
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
        
        # Clean and prepare data
        self.df = self.df.dropna()
        
        # Prepare processed dataframe for ML
        self.processed_df = self.df.copy()
        
        # Encode categorical variables
        categorical_columns = [
            'traffic_control_device', 'weather_condition', 'lighting_condition',
            'first_crash_type', 'trafficway_type', 'alignment', 'roadway_surface_cond',
            'crash_type', 'prim_contributory_cause'
        ]
        
        self.label_encoders = {}
        for col in categorical_columns:
            if col in self.processed_df.columns:
                le = LabelEncoder()
                self.processed_df[col] = le.fit_transform(self.processed_df[col].astype(str))
                self.label_encoders[col] = le

    def create_sample_data(self):
        """Create sample data if the main dataset can't be loaded"""
        import numpy as np
        np.random.seed(42)
        n_samples = 1000
        
        self.df = pd.DataFrame({
            'crash_hour': np.random.randint(0, 24, n_samples),
            'crash_day_of_week': np.random.randint(1, 8, n_samples),
            'crash_month': np.random.randint(1, 13, n_samples),
            'weather_condition': np.random.choice(['CLEAR', 'RAIN', 'SNOW', 'CLOUDY'], n_samples),
            'lighting_condition': np.random.choice(['DAYLIGHT', 'DARKNESS', 'DAWN', 'DUSK'], n_samples),
            'first_crash_type': np.random.choice(['REAR END', 'SIDESWIPE', 'HEAD ON', 'ANGLE'], n_samples),
            'injuries_total': np.random.poisson(0.5, n_samples),
            'injuries_fatal': np.random.binomial(1, 0.01, n_samples),
            'num_units': np.random.randint(1, 5, n_samples)
        })
        
        self.processed_df = self.df.copy()
        
        # Simple encoding for sample data
        categorical_cols = ['weather_condition', 'lighting_condition', 'first_crash_type']
        self.label_encoders = {}
        
        for col in categorical_cols:
            le = LabelEncoder()
            self.processed_df[col] = le.fit_transform(self.df[col])
            self.label_encoders[col] = le

    def get_basic_stats(self):
        """Get basic statistics about the traffic accidents"""
        total_accidents = len(self.df)
        fatal_accidents = int(self.df['injuries_fatal'].sum())
        injury_accidents = int(self.df[self.df['injuries_total'] > 0].shape[0])
        property_damage_only = total_accidents - injury_accidents
        avg_injuries = float(self.df['injuries_total'].mean())
        
        most_common_crash_type = str(self.df['first_crash_type'].mode().iloc[0])
        most_common_weather = str(self.df['weather_condition'].mode().iloc[0])
        most_common_lighting = str(self.df['lighting_condition'].mode().iloc[0])
        
        return {
            'total_accidents': total_accidents,
            'fatal_accidents': fatal_accidents,
            'injury_accidents': injury_accidents,
            'property_damage_only': property_damage_only,
            'avg_injuries_per_accident': avg_injuries,
            'most_common_crash_type': most_common_crash_type,
            'most_common_weather': most_common_weather,
            'most_common_lighting': most_common_lighting
        }

    def get_time_analysis(self):
        """Analyze accidents by time patterns"""
        # Hourly distribution
        hourly_dist = self.df['crash_hour'].value_counts().sort_index()
        hourly_data = [{'hour': int(hour), 'accidents': int(count)} for hour, count in hourly_dist.items()]
        
        # Daily distribution
        daily_dist = self.df['crash_day_of_week'].value_counts().sort_index()
        day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        daily_data = [{'day': day_names[day-1], 'accidents': int(count)} for day, count in daily_dist.items()]
        
        # Monthly distribution
        monthly_dist = self.df['crash_month'].value_counts().sort_index()
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        monthly_data = [{'month': month_names[month-1], 'accidents': int(count)} for month, count in monthly_dist.items()]
        
        return {
            'hourly_distribution': hourly_data,
            'daily_distribution': daily_data,
            'monthly_distribution': monthly_data
        }

    def train_severity_model(self):
        """Train machine learning models to predict accident severity"""
        # Prepare features and target
        feature_columns = [
            'crash_hour', 'crash_day_of_week', 'crash_month', 'num_units',
            'traffic_control_device', 'weather_condition', 'lighting_condition',
            'first_crash_type', 'trafficway_type'
        ]
        
        available_features = [col for col in feature_columns if col in self.processed_df.columns]
        X = self.processed_df[available_features]
        
        # Create severity target (simplified)
        y = pd.cut(self.df['injuries_total'], 
                  bins=[-1, 0, 1, 5, float('inf')], 
                  labels=['No Injury', 'Minor', 'Moderate', 'Severe'])
        
        # Remove NaN values
        valid_indices = ~(X.isnull().any(axis=1) | y.isnull())
        X = X[valid_indices]
        y = y[valid_indices]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train Random Forest
        rf_model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
        rf_model.fit(X_train, y_train)
        rf_pred = rf_model.predict(X_test)
        rf_accuracy = float(accuracy_score(y_test, rf_pred))
        
        # Train Decision Tree
        dt_model = DecisionTreeClassifier(random_state=42, max_depth=8)
        dt_model.fit(X_train, y_train)
        dt_pred = dt_model.predict(X_test)
        dt_accuracy = float(accuracy_score(y_test, dt_pred))
        
        # Feature importance
        rf_importance = dict(zip(available_features, [float(x) for x in rf_model.feature_importances_]))
        dt_importance = dict(zip(available_features, [float(x) for x in dt_model.feature_importances_]))
        
        # Confusion matrices
        rf_cm = confusion_matrix(y_test, rf_pred).tolist()
        dt_cm = confusion_matrix(y_test, dt_pred).tolist()
        
        return {
            'random_forest': {
                'accuracy': rf_accuracy,
                'feature_importance': rf_importance,
                'confusion_matrix': rf_cm
            },
            'decision_tree': {
                'accuracy': dt_accuracy,
                'feature_importance': dt_importance,
                'confusion_matrix': dt_cm
            },
            'class_labels': y.cat.categories.tolist(),
            'test_size': 0.2,
            'model_comparison': {
                'rf_accuracy': rf_accuracy,
                'dt_accuracy': dt_accuracy,
                'better_model': 'Random Forest' if rf_accuracy > dt_accuracy else 'Decision Tree',
                'accuracy_difference': abs(rf_accuracy - dt_accuracy)
            }
        }

    def perform_clustering(self, n_clusters=5):
        """Perform K-means clustering on accident data"""
        # Select numerical features for clustering
        cluster_features = ['crash_hour', 'crash_day_of_week', 'crash_month', 'num_units', 'injuries_total']
        available_features = [col for col in cluster_features if col in self.df.columns]
        
        X = self.df[available_features].copy()
        X = X.dropna()
        
        # Normalize the features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Perform K-means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(X_scaled)
        
        # Analyze clusters
        cluster_analysis = []
        for i in range(n_clusters):
            cluster_data = X[clusters == i]
            cluster_info = {
                'cluster': i,
                'size': int(len(cluster_data)),
                'avg_hour': float(cluster_data['crash_hour'].mean()),
                'avg_injuries': float(cluster_data['injuries_total'].mean()) if 'injuries_total' in cluster_data.columns else 0,
                'characteristics': f"Cluster {i}"
            }
            cluster_analysis.append(cluster_info)
        
        return {
            'clusters': cluster_analysis,
            'n_clusters': n_clusters,
            'total_samples': int(len(X))
        }

# Global analyzer instance (will be initialized on first use)
analyzer = None

def get_analyzer():
    global analyzer
    if analyzer is None:
        analyzer = TrafficAccidentAnalyzer()
    return analyzer

def handler(event, context):
    """Netlify function handler"""
    
    # Set CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Content-Type': 'application/json'
    }
    
    # Handle preflight requests
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        # Get the analyzer instance
        analyzer_instance = get_analyzer()
        
        # Parse the path to determine which endpoint to call
        path = event.get('path', '').replace('/.netlify/functions/api', '')
        
        if path == '/stats':
            result = analyzer_instance.get_basic_stats()
        elif path == '/time-analysis':
            result = analyzer_instance.get_time_analysis()
        elif path == '/ml-model':
            result = analyzer_instance.train_severity_model()
        elif path == '/clustering':
            # Get query parameters
            query_params = event.get('queryStringParameters') or {}
            n_clusters = int(query_params.get('clusters', 5))
            result = analyzer_instance.perform_clustering(n_clusters)
        elif path == '/health':
            result = {
                'status': 'healthy',
                'data_loaded': analyzer_instance.df is not None,
                'total_records': len(analyzer_instance.df) if analyzer_instance.df is not None else 0
            }
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Endpoint not found'})
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }