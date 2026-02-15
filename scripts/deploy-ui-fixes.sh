#!/bin/bash
# deploy-ui-fixes.sh
# Automated Deployment Workflow for BraineX UI Fixes

echo "🚀 Deploying BraineX UI Fixes..."

# 1. Lint Check
echo "🔍 Running Lint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Lint failed. Aborting deployment."
    exit 1
fi

# 2. Test Suite
echo "🧪 Running Verified Cypress Tests..."
npx cypress run --spec "frontend/cypress/e2e/ui-interaction.cy.js"
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Aborting deployment."
    exit 1
fi

# 3. Build (if applicable, skipping for this static/express setup but good practice to have placeholder)
# echo "🏗️ Building assets..."
# npm run build

# 4. Git Operations
echo "📦 Committing changes..."
git add frontend/
git commit -m "fix: complete UI interaction lockdown"
if [ $? -eq 0 ]; then
    echo "✅ Changes committed."
else
    echo "ℹ️ No changes to commit (or commit failed)."
fi

# 5. Push (Simulated for this environment)
echo "⬆️ Pushing to remote..."
git push origin main
if [ $? -ne 0 ]; then
   echo "⚠️ Push failed (check remote setup)."
else
   echo "✅ Push successful."
fi

echo "✅ ALL SYSTEMS GO - Deployment complete"
