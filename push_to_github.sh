#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🚀 Pushing Shinigami: The Golden Pot to GitHub..."
git push -u origin main
git push -u origin gh-pages

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Push successful!"
  echo "🌐 Your repository is live at: https://github.com/saltymother/shinigami-the-golden-pot"
  echo "📄 GitHub Pages will be live shortly at: https://saltymother.github.io/shinigami-the-golden-pot/"
else
  echo ""
  echo "❌ Push failed. Please verify that:"
  echo "  1. You created the repository at https://github.com/new (named 'shinigami-the-golden-pot')"
fi
