#!/bin/bash

# Safari Extension Setup Script
# This script copies the extension files to the Safari extension Resources folder

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
RESOURCES_DIR="$SCRIPT_DIR/Keyboard and Mouse for Xbox Cloud Gaming/Shared (Extension)/Resources"
IMAGES_DIR="$RESOURCES_DIR/images"

echo "🦁 Safari Extension Setup"
echo "========================="
echo ""

# Check if running on macOS
if [[ "$(uname)" != "Darwin" ]]; then
    echo "⚠️  Warning: This script is intended for macOS."
    echo "   You can still copy files manually on other systems."
    echo ""
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p "$RESOURCES_DIR"
mkdir -p "$IMAGES_DIR"
mkdir -p "$RESOURCES_DIR/_locales"

# Copy main extension files
echo "📋 Copying extension files..."
cp "$PARENT_DIR/background.js" "$RESOURCES_DIR/"
cp "$PARENT_DIR/content.js" "$RESOURCES_DIR/"
cp "$PARENT_DIR/injected.js" "$RESOURCES_DIR/"
cp "$PARENT_DIR/popup.html" "$RESOURCES_DIR/"
cp "$PARENT_DIR/popup.js" "$RESOURCES_DIR/"

# Copy locales
echo "🌍 Copying localization files..."
cp -r "$PARENT_DIR/_locales/"* "$RESOURCES_DIR/_locales/"

# Copy and rename icons
echo "🎨 Copying icons..."
if [ -d "$PARENT_DIR/icons" ]; then
    cp "$PARENT_DIR/icons/icon16.png" "$IMAGES_DIR/icon-16.png" 2>/dev/null || true
    cp "$PARENT_DIR/icons/icon32.png" "$IMAGES_DIR/icon-32.png" 2>/dev/null || true
    cp "$PARENT_DIR/icons/icon48.png" "$IMAGES_DIR/icon-48.png" 2>/dev/null || true
    cp "$PARENT_DIR/icons/icon128.png" "$IMAGES_DIR/icon-128.png" 2>/dev/null || true

    # Create larger icons if ImageMagick is available
    if command -v convert &> /dev/null; then
        echo "   Creating 256px and 512px icons..."
        convert "$PARENT_DIR/icons/icon128.png" -resize 256x256 "$IMAGES_DIR/icon-256.png" 2>/dev/null || true
        convert "$PARENT_DIR/icons/icon128.png" -resize 512x512 "$IMAGES_DIR/icon-512.png" 2>/dev/null || true
    else
        echo "   ℹ️  ImageMagick not found. Skipping 256px and 512px icons."
        echo "      You can create these manually or install ImageMagick:"
        echo "      brew install imagemagick"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Open Xcode"
echo "2. Create a new Safari Extension App project"
echo "3. Replace the Resources folder contents with the files in:"
echo "   $RESOURCES_DIR"
echo "4. Build and run the project"
echo ""
echo "See README.md for detailed instructions."
