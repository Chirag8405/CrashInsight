# Chicago Traffic Accident Analysis Platform

A comprehensive, modern web application for analyzing Chicago traffic accident data using advanced machine learning techniques, interactive visualizations, and association rule mining.

## 🌟 Features

### **Real-time Analytics Dashboard**
- **209,303+ Traffic Accidents** analyzed from Chicago dataset
- Interactive charts and visualizations using Chart.js
- Time-based analysis (hourly, daily, monthly patterns)
- Severity distribution analysis
- Location-based insights

### **Machine Learning Models**
- **Random Forest Classifier** for accident severity prediction
- **Accuracy: ~78%** on test dataset
- Feature importance analysis
- Real-time model performance metrics

### **K-Means Clustering Analysis**
- Intelligent accident pattern recognition
- 5-cluster analysis revealing distinct accident types
- Cluster characteristics and insights
- Geographic and temporal clustering patterns

### **Association Rules Mining**
- **Apriori Algorithm** implementation
- Discovers hidden relationships between accident factors
- Configurable support and confidence thresholds
- Interactive rule exploration with lift metrics

### **Modern UI/UX**
- **React 18 + TypeScript** frontend
- **Tailwind CSS** with glass morphism design
- **Framer Motion** animations
- Responsive mobile-first design
- Dark/light theme support

## 🏗️ Architecture

### **Frontend (React + Vite)**
```
src/
├── components/
│   ├── Navbar.tsx          # Navigation with glass morphism
│   ├── Hero.tsx            # Landing page with animations
│   ├── Features.tsx        # Feature showcase
│   ├── Dashboard.tsx       # Main analytics dashboard
│   ├── AssociationRules.tsx # Association rules mining
│   └── Footer.tsx          # Professional footer
├── App.tsx                 # Main application routing
└── main.tsx               # Application entry point
```

### **Backend (Python Flask)**
```
backend/
├── app.py                 # Main Flask application
├── TrafficAccidentAnalyzer # Core data processing class
└── traffic_accidents.csv  # Chicago traffic dataset
```

### **API Endpoints**
- `GET /api/health` - API health check
- `GET /api/stats` - Basic accident statistics
- `GET /api/time-analysis` - Time-based patterns
- `GET /api/severity-analysis` - Severity insights
- `GET /api/location-analysis` - Location patterns
- `GET /api/ml-model` - Machine learning results
- `GET /api/clustering` - K-means clustering analysis
- `GET /api/association-rules` - Association rule mining

## 📊 Dataset Analysis

### **Dataset Overview**
- **Total Records**: 209,303 traffic accidents
- **Time Period**: Chicago traffic accidents dataset
- **Features**: 24 columns including:
  - Crash time and location details
  - Weather and lighting conditions
  - Traffic control devices
  - Crash types and severity
  - Injury statistics
  - Contributing factors

### **Key Statistics**
- **Fatal Accidents**: 351 (0.17%)
- **Injury Accidents**: 54,517 (26.04%)
- **Property Damage Only**: 154,786 (73.96%)
- **Average Injuries per Accident**: 0.38
- **Most Common Crash Type**: Turning
- **Most Common Weather**: Clear
- **Most Common Lighting**: Daylight

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.8+
- Chicago traffic accidents dataset (included)

### **Installation**

1. **Install frontend dependencies**
```bash
npm install
```

2. **Set up Python environment**
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
pip install pandas numpy scikit-learn flask flask-cors matplotlib seaborn plotly mlxtend scipy
```

3. **Prepare backend**
```bash
cp traffic_accidents.csv backend/
```

### **Running the Application**

1. **Start the backend API**
```bash
cd backend
python app.py
```
Server runs on: `http://localhost:5000`

2. **Start the frontend**
```bash
npm run dev
```
Application runs on: `http://localhost:5173`

3. **Access the dashboard**
Open your browser and navigate to `http://localhost:5173`

## 📈 Usage

### **Analytics Dashboard**
1. Navigate to the Analytics tab
2. Explore real-time statistics and charts
3. Analyze time patterns and severity distributions
4. View location-based insights

### **ML Models**
1. Switch to the ML Models tab
2. View model performance metrics
3. Analyze feature importance
4. Understand prediction accuracy

### **Clustering Analysis**
1. Go to the Clustering tab
2. Explore the 5 discovered accident clusters
3. Understand cluster characteristics
4. Analyze patterns and insights

### **Association Rules**
1. Navigate to Association Rules tab
2. Adjust minimum support threshold (0.5% - 5%)
3. Explore discovered rules and relationships
4. Understand confidence and lift metrics

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern UI library
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Chart.js** - Interactive data visualizations
- **Axios** - API communication
- **Heroicons** - Beautiful icon library

### **Backend**
- **Python Flask** - Lightweight web framework
- **Pandas** - Data manipulation and analysis
- **Scikit-learn** - Machine learning algorithms
- **NumPy** - Numerical computing
- **MLxtend** - Association rule mining
- **Flask-CORS** - Cross-origin requests

## 🎨 Design Features

### **Glass Morphism UI**
- Translucent components with backdrop blur
- Modern gradient backgrounds
- Smooth hover animations
- Responsive design patterns

### **Interactive Visualizations**
- Real-time data updates
- Hover tooltips and interactions
- Color-coded severity indicators
- Animated chart transitions

## 🔍 Key Insights Discovered

### **Time Patterns**
- Peak accident hours: 3-6 PM (rush hour)
- Friday has the highest accident rate
- Summer months show increased accidents

### **Severity Factors**
- Weather conditions significantly impact severity
- Lighting conditions correlate with injury rates
- Traffic control devices reduce severe accidents

### **Association Rules Examples**
- `DAYLIGHT → CLEAR WEATHER` (82.4% confidence)
- `TRAFFIC SIGNAL → REAR END CRASH` (High confidence)
- `WET ROADS → INCREASED INJURIES` (Significant lift)

---

**Built with ❤️ for traffic safety analysis and modern web development**