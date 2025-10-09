# 🚀 CrashInsight Deployment Guide

## 📋 Overview
Your CrashInsight application consists of:
- **Frontend**: React + Vite (49MB after build)
- **Backend**: Flask API with ML models
- **Dataset**: 49MB CSV file with traffic accident data

## 🆓 Option 1: Free Hosting (Recommended)

### Frontend Deployment (Vercel - Free)

1. **Prepare Repository**
   ```bash
   # Make sure your code is committed to GitHub
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Select your `CrashInsight` repository
   - Framework Preset: `Vite`
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add Environment Variable:
     - Name: `VITE_API_BASE_URL`
     - Value: `https://your-backend-url.railway.app/api` (update after backend deployment)

### Backend Deployment (Railway - Free)

1. **Prepare Backend for Deployment**
   ```bash
   cd backend
   # Files are already created: requirements.txt, Procfile, railway.toml
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose "Deploy from repo root" but select the `backend` folder
   - Railway will auto-detect it's a Python app
   - Set environment variables:
     - `FLASK_ENV`: `production`
     - `DATASET_PATH`: `./traffic_accidents.csv`

3. **Get Your Backend URL**
   - After deployment, Railway will provide a URL like: `https://crashinsight-backend-production.railway.app`
   - Update your frontend environment variable with this URL

### Dataset Hosting Options

**Option A: Include in Repository (Current Setup)**
- ✅ Your 49MB dataset works fine on GitHub (100MB limit)
- ✅ Automatically deployed with your backend
- ✅ No additional setup required

**Option B: External Hosting (For larger datasets)**
```python
# If you need to host dataset externally, update app.py:
import requests
import io

def load_external_dataset():
    # Google Drive public link example
    url = "https://drive.google.com/uc?id=YOUR_FILE_ID"
    response = requests.get(url)
    return pd.read_csv(io.StringIO(response.text))
```

## 💰 Option 2: Paid Hosting (Better Performance)

### Frontend: Vercel Pro ($20/month)
- Unlimited bandwidth
- Priority support
- Advanced analytics

### Backend: Railway Pro ($5-20/month)
- More CPU/RAM
- Custom domains
- Better uptime

## 🚀 Quick Deployment Steps

### Step 1: Deploy Backend First
```bash
# 1. Push your code to GitHub
git add . && git commit -m "Ready for deployment" && git push

# 2. Go to railway.app → New Project → Deploy from GitHub
# 3. Select your repo, choose backend folder
# 4. Set environment variables (FLASK_ENV=production)
# 5. Get your Railway URL (e.g., https://yourapp.railway.app)
```

### Step 2: Deploy Frontend
```bash
# 1. Update .env file with your Railway backend URL
echo "VITE_API_BASE_URL=https://your-railway-url.railway.app/api" > .env.production

# 2. Go to vercel.com → New Project → Import Git Repository
# 3. Select your repo
# 4. Add environment variable: VITE_API_BASE_URL with your backend URL
# 5. Deploy!
```

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