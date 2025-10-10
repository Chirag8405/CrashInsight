# CrashInsight Docker Deployment Guide# 🚀 CrashInsight Deployment Guide



## Overview## 📋 Overview

This project is now configured as a single Docker container that includes both the React frontend and Flask backend. The container uses a multi-stage build process.Your CrashInsight application consists of:

- **Frontend**: React + Vite (49MB after build)

## Architecture- **Backend**: Flask API with ML models

- **Stage 1**: Builds the React frontend using Node.js- **Dataset**: 49MB CSV file with traffic accident data

- **Stage 2**: Creates the Python backend and copies the built frontend assets

- **Final Result**: Single container serving both API endpoints and static frontend## 🆓 Option 1: Free Hosting (Recommended)



## Local Development### Frontend Deployment (Vercel - Free)



### Prerequisites1. **Prepare Repository**

- Docker installed on your system   ```bash

- Git for version control   # Make sure your code is committed to GitHub

   git add .

### Running Locally   git commit -m "Prepare for deployment"

```bash   git push origin main

# Clone and navigate to the project   ```

cd /path/to/CrashInsight

2. **Deploy to Vercel**

# Build the Docker image   - Go to [vercel.com](https://vercel.com)

docker build -t crashinsight .   - Sign in with GitHub

   - Click "New Project"

# Run the container   - Select your `CrashInsight` repository

docker run -p 10000:10000 crashinsight   - Framework Preset: `Vite`

   - Root Directory: `./` (default)

# Or use docker-compose   - Build Command: `npm run build`

docker-compose up --build   - Output Directory: `dist`

```   - Add Environment Variable:

     - Name: `VITE_API_BASE_URL`

The application will be available at: http://localhost:10000     - Value: `https://your-backend-url.railway.app/api` (update after backend deployment)



## Render.com Deployment### Backend Deployment (Railway - Free)



### Method 1: Using render.yaml (Recommended)1. **Prepare Backend for Deployment**

1. Push your code to GitHub   ```bash

2. Connect your GitHub repository to Render.com   cd backend

3. Render will automatically detect the `render.yaml` file and deploy   # Files are already created: requirements.txt, Procfile, railway.toml

   ```

### Method 2: Manual Setup

1. Create a new Web Service on Render.com2. **Deploy to Railway**

2. Connect your GitHub repository   - Go to [railway.app](https://railway.app)

3. Set the following configuration:   - Sign in with GitHub

   - **Environment**: Docker   - Click "New Project" → "Deploy from GitHub repo"

   - **Dockerfile Path**: ./Dockerfile   - Select your repository

   - **Port**: 10000   - Choose "Deploy from repo root" but select the `backend` folder

   - **Health Check Path**: /api/health   - Railway will auto-detect it's a Python app

   - Set environment variables:

### Environment Variables     - `FLASK_ENV`: `production`

The following environment variables are automatically set:     - `DATASET_PATH`: `./traffic_accidents.csv`

- `FLASK_ENV=production`

- `PORT=10000`3. **Get Your Backend URL**

   - After deployment, Railway will provide a URL like: `https://crashinsight-backend-production.railway.app`

## Application Structure   - Update your frontend environment variable with this URL

```

/app/### Dataset Hosting Options

├── static/              # Built React frontend (created during Docker build)

│   ├── index.html**Option A: Include in Repository (Current Setup)**

│   ├── assets/- ✅ Your 49MB dataset works fine on GitHub (100MB limit)

│   └── ...- ✅ Automatically deployed with your backend

├── app.py              # Flask application (serves both API and static files)- ✅ No additional setup required

├── traffic_accidents.csv

└── requirements.txt**Option B: External Hosting (For larger datasets)**

``````python

# If you need to host dataset externally, update app.py:

## API Endpointsimport requests

All API endpoints are available at `/api/*`:import io

- `GET /api/health` - Health check

- `GET /api/stats` - Basic statisticsdef load_external_dataset():

- `GET /api/time-analysis` - Time-based analysis    # Google Drive public link example

- `GET /api/ml-model` - Machine learning model results    url = "https://drive.google.com/uc?id=YOUR_FILE_ID"

- `GET /api/clustering` - Clustering analysis    response = requests.get(url)

- `GET /api/association-rules` - Association rules mining    return pd.read_csv(io.StringIO(response.text))

```

## Frontend Routing

The Flask app is configured to serve the React application and handle client-side routing:## 💰 Option 2: Paid Hosting (Better Performance)

- Root route `/` serves the React app

- All unknown routes fall back to React Router### Frontend: Vercel Pro ($20/month)

- Static assets are served from the `/static` directory- Unlimited bandwidth

- Priority support

## Key Features Restored- Advanced analytics

✅ Full ML functionality with scikit-learn

✅ Association rules mining with mlxtend### Backend: Railway Pro ($5-20/month)

✅ Decision tree visualization with graphviz- More CPU/RAM

✅ Data processing with pandas and numpy- Custom domains

✅ Single container deployment- Better uptime

✅ Production-ready configuration

## 🚀 Quick Deployment Steps

## Troubleshooting

### Step 1: Deploy Backend First

### Common Issues```bash

1. **Build fails**: Ensure all dependencies are in requirements.txt# 1. Push your code to GitHub

2. **Frontend not loading**: Check that the build stage completed successfullygit add . && git commit -m "Ready for deployment" && git push

3. **API not responding**: Verify the health check endpoint

# 2. Go to railway.app → New Project → Deploy from GitHub

### Logs# 3. Select your repo, choose backend folder

View container logs:# 4. Set environment variables (FLASK_ENV=production)

```bash# 5. Get your Railway URL (e.g., https://yourapp.railway.app)

# Local```

docker logs <container_id>

### Step 2: Deploy Frontend

# Render```bash

Check the deployment logs in your Render dashboard# 1. Update .env file with your Railway backend URL

```echo "VITE_API_BASE_URL=https://your-railway-url.railway.app/api" > .env.production



## Benefits of This Approach# 2. Go to vercel.com → New Project → Import Git Repository

1. **Simplified Deployment**: Single container eliminates CORS issues# 3. Select your repo

2. **Version Control**: Frontend and backend versions are always in sync# 4. Add environment variable: VITE_API_BASE_URL with your backend URL

3. **Cost Effective**: Uses only one service instead of separate frontend/backend# 5. Deploy!

4. **Production Ready**: Uses Python 3.11 for stable ML library compatibility```

5. **Scalable**: Can be easily scaled on Render or other container platforms
### Step 3: Update CORS (Important!)
After getting your Vercel URL, update `backend/app.py`:
```python
# Replace this line:
CORS(app, origins=["https://your-frontend-domain.vercel.app", "https://crashinsight.vercel.app"])

# With your actual Vercel URL:
CORS(app, origins=["https://crashinsight-chi.vercel.app"])
```

## 🔧 Environment Variables Setup

### Frontend (.env.production)
```
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
```

### Backend (Railway Environment Variables)
```
FLASK_ENV=production
DATASET_PATH=./traffic_accidents.csv
PORT=5000
```

## 🧪 Testing Your Deployment

### Health Check Endpoints
- Backend: `https://your-backend.railway.app/api/health`
- Frontend: `https://your-app.vercel.app`

### Expected Response
```json
{
  "status": "healthy",
  "data_loaded": true,
  "total_records": 208804
}
```

## 📱 Alternative Free Options

### Backend Alternatives
1. **Render** (render.com) - Similar to Railway
2. **Heroku** (Free tier discontinued, but still good)
3. **PythonAnywhere** (Free tier with limitations)

### Frontend Alternatives
1. **Netlify** (netlify.com) - Similar to Vercel
2. **GitHub Pages** (For static sites)
3. **Firebase Hosting** (Google)

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CORS origins in `app.py` with your actual frontend URL

2. **Dataset Not Found**
   - Check `DATASET_PATH` environment variable
   - Ensure `traffic_accidents.csv` is in the backend folder

3. **Build Failures**
   - Check Node.js version (use Node 18+)
   - Verify all dependencies in `package.json`

4. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` in frontend environment variables
   - Check backend health endpoint

### Support Commands
```bash
# Check build locally
npm run build && npm run preview

# Test backend locally
cd backend && python app.py

# View environment variables
echo $VITE_API_BASE_URL
```

## 📊 Performance Tips

1. **Dataset Optimization**
   - Consider data compression for faster loading
   - Implement pagination for large datasets

2. **Caching**
   - Add Redis for ML model caching in production
   - Enable browser caching for static assets

3. **CDN**
   - Both Vercel and Railway include CDN by default

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use platform environment variable settings

2. **CORS Configuration**
   - Restrict to your actual domain in production
   - Avoid wildcard (*) origins in production

3. **API Rate Limiting**
   - Consider adding rate limiting to your Flask app
   - Monitor usage on hosting platforms

Your CrashInsight app is now ready for deployment! 🎉