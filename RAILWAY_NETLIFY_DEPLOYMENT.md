# Railway + Netlify Deployment Guide

This guide explains how to deploy your CrashInsight application with:
- **Backend**: Railway (Python Flask with dataset)
- **Frontend**: Netlify (React TypeScript)

## 🚀 Backend Deployment (Railway)

### Prerequisites
1. Create a free account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`

### Step 1: Deploy Backend to Railway

1. **Navigate to backend directory:**
   ```bash
   cd backend/
   ```

2. **Initialize Railway project:**
   ```bash
   railway init
   # Follow prompts to create new project
   ```

3. **Deploy the backend:**
   ```bash
   railway up
   ```

4. **Set environment variables (if needed):**
   ```bash
   railway variables set FLASK_ENV=production
   ```

5. **Get your Railway URL:**
   ```bash
   railway domain
   # This will show your app URL like: https://your-app-name.railway.app
   ```

### Step 2: Backend Configuration

Your backend is already configured with:
- ✅ `requirements.txt` - Python dependencies
- ✅ `Procfile` - Railway deployment config
- ✅ `app.py` - Flask application with CORS
- ✅ `traffic_accidents.csv` - Dataset
- ✅ `railway.toml` - Railway configuration

The backend will be available at: `https://your-app-name.railway.app`

## 🌐 Frontend Deployment (Netlify)

### Prerequisites
1. Create account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository

### Step 1: Update Environment Variables

1. **Create production environment file:**
   ```bash
   # In root directory (not backend/)
   cp .env.example .env.production
   ```

2. **Update `.env.production` with your Railway URL:**
   ```bash
   VITE_API_BASE_URL=https://your-app-name.railway.app/api
   ```

### Step 2: Deploy to Netlify

1. **Via Netlify Dashboard:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Connect GitHub and select your repository
   - Set build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Add environment variable:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: `https://your-app-name.railway.app/api`

2. **Via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify init
   netlify deploy --build
   netlify deploy --prod --build
   ```

## 🔗 Connecting Frontend and Backend

### Update API URLs

Replace `your-app-name` with your actual Railway app name in:

1. **Environment files** (`.env.production`, `.env.example`)
2. **Railway backend URL** in Netlify environment variables

### CORS Configuration

The backend is already configured to accept requests from Netlify domains:
```python
CORS(app, origins=["https://*.netlify.app", "https://crashinsight.netlify.app"])
```

## 🧪 Testing Deployment

### Test Backend (Railway)
```bash
# Health check
curl https://your-app-name.railway.app/api/health

# Basic stats
curl https://your-app-name.railway.app/api/stats
```

### Test Frontend (Netlify)
1. Visit your Netlify URL: `https://your-site-name.netlify.app`
2. Check browser console for API connection
3. Verify data loads in Dashboard and Analytics sections

## 📁 Project Structure

```
├── src/                    # React frontend (deploys to Netlify)
│   ├── components/
│   └── ...
├── backend/               # Python Flask API (deploys to Railway)
│   ├── app.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── traffic_accidents.csv
│   └── railway.toml
├── package.json           # Frontend dependencies
├── .env.production        # Production environment variables
└── RAILWAY_NETLIFY_DEPLOYMENT.md
```

## 🔧 Environment Variables

### Frontend (Netlify)
- `VITE_API_BASE_URL`: Your Railway backend URL

### Backend (Railway)
- `FLASK_ENV`: Set to "production" (optional)
- `PORT`: Automatically set by Railway

## 🚨 Troubleshooting

### Backend Issues
1. **Railway deployment fails**: Check `railway logs`
2. **Dataset not found**: Ensure `traffic_accidents.csv` is in backend directory
3. **CORS errors**: Verify your Netlify domain is in CORS origins

### Frontend Issues
1. **API calls fail**: Check `VITE_API_BASE_URL` in Netlify environment variables
2. **Build fails**: Ensure all dependencies in `package.json` are correct
3. **Environment variables not working**: Restart Netlify build after adding variables

### Connection Issues
1. **Check Railway URL**: Use `railway domain` to get correct URL
2. **API path**: Ensure URL includes `/api` prefix
3. **HTTPS**: Both Railway and Netlify use HTTPS in production

## 💡 Pro Tips

1. **Custom Domain**: Both Railway and Netlify support custom domains
2. **Environment Variables**: Use Netlify's environment variable UI for easier management
3. **Logs**: Use `railway logs` for backend debugging
4. **Preview Deploys**: Netlify creates preview URLs for pull requests
5. **Database**: If you need a database later, Railway offers PostgreSQL add-ons

## 📞 Support

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **This Project**: Check issues on GitHub repository