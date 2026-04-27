#!/bin/bash

# Deployment script for frontend changes
# This script commits and pushes changes to both main and master branches

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Frontend Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: This script must be run from the frontend directory${NC}"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch:${NC} ${CURRENT_BRANCH}"
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}Uncommitted changes detected${NC}"
    echo ""
    git status -s
    echo ""
    
    # Prompt for commit message
    echo -e "${BLUE}Enter commit message:${NC}"
    read -r COMMIT_MESSAGE
    
    if [ -z "$COMMIT_MESSAGE" ]; then
        COMMIT_MESSAGE="Enhanced landing page pricing section with individual/organization toggle and fixed card overflow issues"
    fi
    
    echo ""
    echo -e "${GREEN}Staging changes...${NC}"
    git add .
    
    echo -e "${GREEN}Committing changes...${NC}"
    git commit -m "$COMMIT_MESSAGE"
    echo ""
else
    echo -e "${GREEN}No uncommitted changes detected${NC}"
    echo ""
fi

# Function to push to a branch
push_to_branch() {
    local BRANCH=$1
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Pushing to ${BRANCH}${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # Check if branch exists locally
    if git show-ref --verify --quiet refs/heads/${BRANCH}; then
        echo -e "${GREEN}Branch ${BRANCH} exists locally${NC}"
        
        # Checkout the branch
        echo -e "${GREEN}Checking out ${BRANCH}...${NC}"
        git checkout ${BRANCH}
        
        # Merge changes from current branch if different
        if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
            echo -e "${GREEN}Merging changes from ${CURRENT_BRANCH}...${NC}"
            git merge ${CURRENT_BRANCH} --no-edit
        fi
        
        # Push to remote
        echo -e "${GREEN}Pushing to remote ${BRANCH}...${NC}"
        git push origin ${BRANCH}
        echo -e "${GREEN}✓ Successfully pushed to ${BRANCH}${NC}"
        echo ""
    else
        echo -e "${YELLOW}Branch ${BRANCH} does not exist locally${NC}"
        
        # Check if branch exists on remote
        if git ls-remote --heads origin ${BRANCH} | grep -q ${BRANCH}; then
            echo -e "${GREEN}Branch ${BRANCH} exists on remote, checking out...${NC}"
            git checkout -b ${BRANCH} origin/${BRANCH}
            
            # Merge changes from current branch
            if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
                echo -e "${GREEN}Merging changes from ${CURRENT_BRANCH}...${NC}"
                git merge ${CURRENT_BRANCH} --no-edit
            fi
            
            # Push to remote
            echo -e "${GREEN}Pushing to remote ${BRANCH}...${NC}"
            git push origin ${BRANCH}
            echo -e "${GREEN}✓ Successfully pushed to ${BRANCH}${NC}"
            echo ""
        else
            echo -e "${YELLOW}Branch ${BRANCH} does not exist on remote${NC}"
            echo -e "${YELLOW}Creating new branch ${BRANCH} from ${CURRENT_BRANCH}...${NC}"
            git checkout -b ${BRANCH}
            
            # Push to remote
            echo -e "${GREEN}Pushing to remote ${BRANCH}...${NC}"
            git push -u origin ${BRANCH}
            echo -e "${GREEN}✓ Successfully created and pushed to ${BRANCH}${NC}"
            echo ""
        fi
    fi
}

# Push to main branch
push_to_branch "main"

# Push to master branch
push_to_branch "master"

# Return to original branch
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${BLUE}Returning to original branch: ${CURRENT_BRANCH}${NC}"
    git checkout ${CURRENT_BRANCH}
    echo ""
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete! ✓${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Changes have been pushed to:${NC}"
echo -e "  • ${GREEN}main${NC}"
echo -e "  • ${GREEN}master${NC}"
echo ""
echo -e "${BLUE}Summary of changes:${NC}"
echo -e "  • Enhanced landing page pricing section"
echo -e "  • Added individual/organization plan toggle"
echo -e "  • Fixed card overflow issues"
echo -e "  • Improved 'Most Popular' badge positioning"
echo -e "  • Better content layout and spacing"
echo -e "  • Consistent theme colors throughout"
echo ""
