#!/bin/bash

# DOCX PRD Extraction Quick Start
# Usage: ./quick_extract.sh filename.docx

if [ $# -eq 0 ]; then
    echo "DOCX Chinese Text Extraction - Quick Start"
    echo "==========================================="
    echo ""
    echo "Usage: ./quick_extract.sh <docx_file>"
    echo ""
    echo "Examples:"
    echo "  ./quick_extract.sh 每日打卡PWA_PRD_V2.0.docx"
    echo "  bash quick_extract.sh product.docx"
    echo ""
    echo "Available Scripts:"
    echo "  1. extract_docx.py     - Simple text extraction"
    echo "  2. parse_prd.py        - Advanced PRD parsing with structure"
    echo ""
    echo "Output Files:"
    echo "  - *_extracted.txt      - Plain text output"
    echo "  - *_analysis.json      - Structured analysis"
    echo ""
    exit 1
fi

DOCX_FILE="$1"

if [ ! -f "$DOCX_FILE" ]; then
    echo "Error: File '$DOCX_FILE' not found!"
    exit 1
fi

echo "Starting DOCX extraction and analysis..."
echo "File: $DOCX_FILE"
echo ""

# Run both extraction scripts
echo "Step 1/2: Extracting raw text..."
python3 extract_docx.py "$DOCX_FILE"

echo ""
echo "Step 2/2: Parsing PRD structure..."
python3 parse_prd.py "$DOCX_FILE"

echo ""
echo "Extraction complete!"
echo ""
echo "Generated files:"
STEM="${DOCX_FILE%.*}"
if [ -f "${STEM}_extracted.txt" ]; then
    echo "  ✓ ${STEM}_extracted.txt"
fi
if [ -f "${STEM}_analysis.json" ]; then
    echo "  ✓ ${STEM}_analysis.json"
fi
