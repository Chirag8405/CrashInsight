#!/bin/bash

# Quick Railway Deployment Script for CrashInsight Backend
# Make sure you have Railway CLI installed: npm install -g @railway/cli

set -e

echo "🚂 CrashInsight Railway Deployment"
echo "================================="

# Check if we're in the right directory
if [ ! -f "backend/app.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"

# Navigate to backend directory
cd backend/

echo "📂 Switched to backend directory"

# Check if already initialized
if [ ! -f ".railway" ] && [ ! -f "railway.json" ]; then
    echo "🔧 Initializing new Railway project..."
    railway init
else
    echo "✅ Railway project already initialized"
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Get domain info
echo "🌐 Getting domain information..."
railway domain

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Copy your Railway URL from above"
echo "2. Update .env.production with your Railway URL"
echo "3. Deploy frontend to Netlify"
echo ""
echo "See RAILWAY_NETLIFY_DEPLOYMENT.md for detailed instructions"