#!/bin/bash
cd "$(dirname "$0")"

echo "=================================================="
echo "🚀 Auto-Pushing Go-Viral Project to GitHub..."
echo "=================================================="

# Clean macOS metadata files
find . -name "._*" -delete

# Ensure guest session state in user.json before pushing
if [ -f "data/user.json" ]; then
  echo "null" > data/user.json
fi

# Stage all files
git add -A

# Commit message with timestamp
COMMIT_MSG="Auto Update: $(date +'%Y-%m-%d %H:%M:%S')"

if [ -n "$1" ]; then
  COMMIT_MSG="$1"
fi

git commit -m "$COMMIT_MSG"

# Push to origin main
git push origin main

echo ""
echo "=================================================="
echo "✅ Project successfully updated on GitHub!"
echo "🌐 Vercel live site is auto-redeploying."
echo "=================================================="
