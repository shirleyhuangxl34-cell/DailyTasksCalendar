#!/usr/bin/env python3
"""
DOCX Chinese Text Extractor
Extracts readable Chinese text from DOCX files (which are ZIP archives containing XML)
"""

import zipfile
import re
import sys
from pathlib import Path


def extract_docx_text(docx_path):
    """Extract text from a DOCX file"""
    try:
        with zipfile.ZipFile(docx_path, 'r') as z:
            # Read the main document XML
            with z.open('word/document.xml') as f:
                content = f.read().decode('utf-8')

                # Remove XML tags while preserving text between them
                # Match common OOXML patterns
                text = re.sub(r'<[^>]+>', ' ', content)

                # Clean up excessive whitespace
                text = re.sub(r'\s+', ' ', text)

                # Remove common XML artifacts
                text = re.sub(r'http://[^\s]+', '', text)

                return text.strip()
    except zipfile.BadZipFile:
        print("Error: File is not a valid DOCX file")
        return None
    except KeyError:
        print("Error: Could not find document.xml in DOCX file")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None


def extract_structured_text(docx_path):
    """Extract and structure text from DOCX file, parsing sections"""
    try:
        with zipfile.ZipFile(docx_path, 'r') as z:
            with z.open('word/document.xml') as f:
                content = f.read().decode('utf-8')

                # Extract text nodes (content between <w:t> tags)
                text_pattern = r'<w:t[^>]*>(.*?)</w:t>'
                texts = re.findall(text_pattern, content)

                # Join with spaces
                full_text = ' '.join(texts)

                # Clean up
                full_text = re.sub(r'\s+', ' ', full_text)

                return full_text.strip()
    except Exception as e:
        print(f"Error: {e}")
        return None


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract_docx.py <path_to_docx_file>")
        print("\nExample: python3 extract_docx.py 每日打卡PWA_PRD_V2.0.docx")
        sys.exit(1)

    docx_file = sys.argv[1]

    if not Path(docx_file).exists():
        print(f"Error: File '{docx_file}' not found")
        sys.exit(1)

    print(f"Extracting text from: {docx_file}\n")

    # Try structured extraction first (more reliable for OOXML)
    text = extract_structured_text(docx_file)

    if text:
        print("=" * 80)
        print("EXTRACTED TEXT:")
        print("=" * 80)
        print(text)
        print("=" * 80)

        # Also save to a text file
        output_file = Path(docx_file).stem + "_extracted.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"\nText saved to: {output_file}")
    else:
        print("Failed to extract text")
        sys.exit(1)


if __name__ == "__main__":
    main()
