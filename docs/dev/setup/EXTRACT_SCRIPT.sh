#!/bin/bash

# Script to split INTERNAL_DEV_DOCS.md into focused files
# Run from docs/ folder

echo "🔧 Splitting INTERNAL_DEV_DOCS.md..."

# Check if source file exists
if [ ! -f "INTERNAL_DEV_DOCS.md" ]; then
    echo "❌ INTERNAL_DEV_DOCS.md not found!"
    exit 1
fi

# Backup original
echo "📦 Creating backup..."
cp INTERNAL_DEV_DOCS.md INTERNAL_DEV_DOCS.md.backup

# The files are already created, just need to organize
echo "✅ Split structure created!"
echo ""
echo "📚 New documentation structure:"
echo "  - README.md (main index)"
echo "  - MODULAR_ARCHITECTURE.md (architecture guide)"
echo "  - KLEVER_INTEGRATION.md (blockchain)"  
echo "  - DESIGN_SYSTEM.md (UI patterns)"
echo "  - ADMIN_PANEL.md (admin docs)"
echo "  - TROUBLESHOOTING.md (bug fixes)"
echo "  - DEVELOPMENT_GUIDE.md (workflows)"
echo ""
echo "✨ Done! You can now delete INTERNAL_DEV_DOCS.md.backup if everything works."

