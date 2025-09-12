#!/bin/bash

# PDF Generation Runner Script
echo "🚀 Starting PDF generation for ChatGPT Clone Technical Documentation..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Create docs directory if it doesn't exist
mkdir -p docs

# Install required dependencies if not present
echo "📦 Installing required dependencies..."
npm install --no-save puppeteer marked 2>/dev/null || {
    echo "⚠️  Could not install dependencies automatically"
    echo "Please run: npm install puppeteer marked"
}

# Run the PDF generation script
echo "📄 Generating PDF documentation..."
node scripts/generate-pdf.js

# Check if PDF was created successfully
if [ -f "docs/ChatGPT_Clone_Technical_Documentation.pdf" ]; then
    echo "✅ PDF documentation generated successfully!"
    echo "📍 Location: docs/ChatGPT_Clone_Technical_Documentation.pdf"
    
    # Get file size
    if command -v ls &> /dev/null; then
        echo "📊 File size: $(ls -lh docs/ChatGPT_Clone_Technical_Documentation.pdf | awk '{print $5}')"
    fi
    
    echo ""
    echo "🎉 Technical documentation is ready!"
    echo "The PDF contains comprehensive technical details including:"
    echo "   • Project architecture and tech stack"
    echo "   • Database schemas and API endpoints"
    echo "   • Authentication and security features"
    echo "   • File upload and AI integration systems"
    echo "   • Memory management and frontend components"
    echo "   • Deployment guide and troubleshooting"
    echo ""
    echo "You can now share this documentation with your team or stakeholders."
else
    echo "❌ PDF generation failed. Please check the error messages above."
    exit 1
fi
