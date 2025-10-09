#!/bin/bash

echo "🧪 Testing Netlify Functions Setup..."

# Check if required files exist
if [ -f "netlify/functions/api.py" ]; then
    echo "✅ Netlify function exists"
else
    echo "❌ Netlify function missing"
    exit 1
fi

if [ -f "netlify.toml" ]; then
    echo "✅ Netlify config exists"
else
    echo "❌ Netlify config missing"
    exit 1
fi

if [ -f "traffic_accidents.csv" ]; then
    echo "✅ Dataset exists"
else
    echo "❌ Dataset missing"
    exit 1
fi

echo "✅ All files ready for Netlify deployment!"
echo ""
echo "🚀 Next steps:"
echo "1. npm install"
echo "2. npm run dev (for local testing)"
echo "3. git push (for deployment)"
echo ""
echo "📖 See NETLIFY_DEPLOYMENT.md for detailed instructions"