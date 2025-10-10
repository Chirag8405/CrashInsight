#!/bin/bash

# Render.com Deployment Guide for CrashInsight Backend
# This is a reference guide - Render deploys automatically from Git

echo "🎯 CrashInsight Backend - Render.com Deployment"
echo "==============================================="

echo ""
echo "📋 Render Configuration:"
echo "   Service Type: Web Service"
echo "   Environment: Python 3"
echo "   Build Command: pip install -r requirements.txt"
echo "   Start Command: gunicorn app:app --bind 0.0.0.0:\$PORT"
echo "   Root Directory: backend"
echo ""

echo "🔧 Environment Variables to set in Render Dashboard:"
echo "   FLASK_ENV=production"
echo "   PYTHON_VERSION=3.11.0"
echo ""

echo "📁 Required Files (✅ Already configured):"
echo "   ✅ requirements.txt - Python dependencies"
echo "   ✅ Procfile - Gunicorn configuration"  
echo "   ✅ render.yaml - Render settings"
echo "   ✅ app.py - Flask application"
echo "   ✅ traffic_accidents.csv - Dataset (49MB)"
echo ""

echo "🚀 Deployment Steps:"
echo "   1. Go to render.com and create account"
echo "   2. Click 'New +' → 'Web Service'"
echo "   3. Connect GitHub and select this repository"
echo "   4. Set root directory to 'backend'"
echo "   5. Configure build/start commands above"
echo "   6. Add environment variables"
echo "   7. Click 'Create Web Service'"
echo ""

echo "🌐 Your backend will be available at:"
echo "   https://your-service-name.onrender.com/api"
echo ""

echo "📖 Full guide: RENDER_NETLIFY_DEPLOYMENT.md"