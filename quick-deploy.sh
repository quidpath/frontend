#!/bin/bash

# Quick deployment script for frontend changes
# Commits and pushes to both main and master branches

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Quick Deploy - Frontend${NC}"
echo ""

# Stage and commit
git add .
git commit -m "Enhanced landing page pricing section with individual/organization toggle and fixed card overflow issues" || echo "Nothing to commit"

# Get current branch
CURRENT=$(git branch --show-current)

# Push to main
echo -e "${GREEN}Pushing to main...${NC}"
git checkout main 2>/dev/null || git checkout -b main
git merge $CURRENT --no-edit 2>/dev/null || true
git push origin main

# Push to master
echo -e "${GREEN}Pushing to master...${NC}"
git checkout master 2>/dev/null || git checkout -b master
git merge $CURRENT --no-edit 2>/dev/null || true
git push origin master

# Return to original branch
git checkout $CURRENT

echo -e "${GREEN}✓ Deployed to main and master!${NC}"
