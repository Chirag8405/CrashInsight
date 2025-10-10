# CrashInsight - AI-Powered Traffic Accident Analytics 🚗📊

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**CrashInsight** is an advanced web application that leverages artificial intelligence and machine learning to analyze traffic accident data, providing actionable insights for improving road safety.

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```
Backend will be available at: http://localhost:5000

### Frontend Setup
```bash
# Navigate to project root
cd ..

# Install Node.js dependencies
npm install

# Start the development server
npm run dev:vite
```
Frontend will be available at: http://localhost:5173

### Full Development Environment
1. Start backend: `cd backend && python app.py`
2. Start frontend: `npm run dev:vite`
3. Open http://localhost:5173 in your browser

## 🌟 Features

### 📈 Analytics Dashboard
- **Real-time Statistics**: Live accident counts, fatality rates, and injury metrics
- **Interactive Charts**: Hourly trends, daily patterns, and severity distributions
- **Dark/Light Mode**: Fully responsive design with theme switching

### 🤖 Machine Learning Insights
- **Predictive Modeling**: Random Forest classifier for crash severity prediction
- **Feature Importance**: Identify key factors contributing to accidents
- **Model Performance**: Real-time accuracy metrics and validation

### 🔍 Pattern Analysis
- **Clustering Analysis**: AI-powered accident pattern recognition
- **Risk Assessment**: Visual risk categorization (High/Medium/Low)
- **Time-based Patterns**: Rush hour, weekend, and seasonal trends

### 📋 Association Rules Mining
- **Accident Causation**: Discover relationships between conditions and outcomes
- **Filtered Insights**: Focus on accident-relevant patterns only
- **Plain English**: Human-readable rule interpretations

## 🚀 Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Chart.js** for data visualizations
- **Vite** for fast development

### Backend
- **Python Flask** REST API
- **Pandas** & **NumPy** for data processing
- **Scikit-learn** for machine learning
- **MLxtend** for association rule mining

### Data
- **Chicago Traffic Accidents Dataset** (209K+ records)
- Real-time API integration
- Comprehensive accident attributes

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.8+ with **pip**
- **Git** for version control

### 1. Clone Repository
```bash
git clone https://github.com/Chirag8405/CrashInsight.git
cd CrashInsight
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

### 4. Access Application
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000/api

## 🚀 Production Deployment

This application is designed for deployment with:
- **Backend**: Render.com (Python Flask with dataset)
- **Frontend**: Netlify (React build)

See [RENDER_NETLIFY_DEPLOYMENT.md](RENDER_NETLIFY_DEPLOYMENT.md) for detailed deployment instructions.

## 📁 Project Structure

```
CrashInsight/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── assets/            # Static assets
│   └── styles/            # CSS files
├── backend/               # Python Flask API
│   ├── app.py            # Main Flask application
│   └── traffic_accidents.csv  # Dataset
├── public/               # Public assets
└── README.md            # Project documentation
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/basic-stats` | GET | Basic accident statistics |
| `/api/time-analysis` | GET | Time-based patterns |
| `/api/location-analysis` | GET | Location-based insights |
| `/api/severity-analysis` | GET | Severity distribution |
| `/api/clustering` | GET | Clustering analysis |
| `/api/ml-model` | GET | ML model training & results |
| `/api/association-rules` | GET | Association rule mining |

## 🎯 Key Insights Discovered

### Accident Patterns
- **High-Risk Pattern**: Evening rush hours on Fridays (avg 2.3+ injuries)
- **Safest Pattern**: Morning weekday accidents (avg 0.8 injuries)
- **Peak Danger Time**: 17:00-19:00 (6-7 PM)

### Association Rules Examples
- **Stop Sign + High Injury → Side-Impact Collision** (67% confidence)
- **Nighttime + Rear-End → Multi-Vehicle Accident** (79% confidence)
- **Clear Weather + Stop Sign → Angle Collision** (66% confidence)

## 🚦 Safety Recommendations

Based on our analysis:

1. **Enhanced Traffic Control** at stop sign intersections during peak hours
2. **Improved Lighting** for nighttime accident prevention
3. **Speed Reduction Measures** in high-injury pattern areas
4. **Driver Education** about angle collision risks at intersections

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**Chirag** - [@Chirag8405](https://github.com/Chirag8405)

Project Link: [https://github.com/Chirag8405/CrashInsight](https://github.com/Chirag8405/CrashInsight)

## 🙏 Acknowledgments

- Chicago Data Portal for accident dataset
- React + Chart.js communities
- Scikit-learn documentation
- MLxtend library for association rules

---

⭐ **Star this repository if you found it helpful!** ⭐