#!/bin/bash

# BallotBox Development Commands

echo "🗳️  BallotBox - Ranked Voting UI"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the project root."
    exit 1
fi

# Show menu
echo "Available commands:"
echo ""
echo "1. npm run dev       - Start development server"
echo "2. npm run build     - Build for production"
echo "3. npm run start     - Start production server"
echo "4. npm run lint      - Run ESLint"
echo ""

# Show project info
echo "Project Structure:"
echo "├── src/app/(voting)/               - Voting routes"
echo "│   ├── page.tsx                    - Entry page"
echo "│   ├── manage/page.tsx             - Vote management"
echo "│   └── vote/"
echo "│       ├── page.tsx                - Vote finder"
echo "│       ├── [label]/page.tsx        - Voting page"
echo "│       └── success/page.tsx        - Confirmation"
echo "├── src/components/ui/              - shadcn/ui components"
echo "│   ├── button.tsx"
echo "│   ├── input.tsx"
echo "│   ├── card.tsx"
echo "│   ├── badge.tsx"
echo "│   └── checkbox.tsx"
echo "└── src/lib/utils.ts                - Utilities"
echo ""
echo "🚀 Run 'npm run dev' to get started!"
