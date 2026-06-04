# DOCX Text Extraction Scripts for Daily Check-in PWA PRD

This directory contains Python scripts to extract and parse Chinese text from DOCX files, specifically designed for the "每日打卡PWA" (Daily Check-in PWA) Product Requirements Document.

## Available Scripts

### 1. `extract_docx.py` - Simple Text Extraction

Extracts all readable text from a DOCX file (which is a ZIP archive containing XML).

**Usage:**
```bash
python3 extract_docx.py 每日打卡PWA_PRD_V2.0.docx
```

**Output:**
- Prints extracted text to console
- Saves extracted text to `每日打卡PWA_PRD_V2.0_extracted.txt`

**How it works:**
1. Opens the DOCX file as a ZIP archive
2. Extracts `word/document.xml` containing the document structure
3. Removes XML tags while preserving text content
4. Cleans up whitespace and artifacts

### 2. `parse_prd.py` - Advanced PRD Parsing

Parses the PRD document into structured components including sections, features, and user stories.

**Usage:**
```bash
python3 parse_prd.py 每日打卡PWA_PRD_V2.0.docx
```

**Output:**
- Displays analysis to console with:
  - Document title extraction
  - Section identification (产品概述, 功能需求, etc.)
  - Feature extraction
  - User story parsing (作为...我想...以便...)
- Saves analysis to `每日打卡PWA_PRD_V2.0_analysis.json`

**Extracted Information:**
- **Sections**: Automatically identifies common PRD sections
- **Features**: Extracts feature descriptions and capabilities
- **User Stories**: Parses Chinese user stories in format "作为[角色]，我想[功能]，以便[受益]"

## DOCX File Structure

DOCX files are ZIP archives containing XML files. The main content is in:
```
每日打卡PWA_PRD_V2.0.docx
└── word/
    ├── document.xml          (Main document content)
    ├── styles.xml            (Formatting styles)
    ├── numbering.xml         (Lists and numbering)
    ├── fontTable.xml         (Font definitions)
    └── ...
```

## How Text Extraction Works

### Method 1: Remove XML Tags
```python
text = re.sub(r'<[^>]+>', ' ', content)  # Remove all XML tags
```

### Method 2: Extract Text Nodes (Preferred)
```python
text_pattern = r'<w:t[^>]*>(.*?)</w:t>'   # Extract from <w:t> tags
texts = re.findall(text_pattern, content)
```

OOXML (Office Open XML) uses `<w:t>` tags to mark text content, making Method 2 more reliable.

## Example OOXML Structure

```xml
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>产品名称</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>每日打卡PWA是一款用于企业员工日常考勤的应用程序</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>
```

## Requirements

- Python 3.6+
- No external dependencies (uses built-in `zipfile`, `re`, `json` modules)

## Chinese Text Support

Both scripts support full UTF-8 Chinese character encoding:
- Extraction preserves Chinese characters
- Parsing recognizes Chinese PRD patterns:
  - 功能 (Features)
  - 需求 (Requirements)
  - 作为...我想... (User Stories)
  - 用户 (User)
  - 界面 (UI)

## Output Formats

### Plain Text Output
```
产品概述 每日打卡PWA是一款用于企业员工日常考勤的应用程序...
```

### JSON Output (from parse_prd.py)
```json
{
  "title": "每日打卡PWA_PRD_V2.0",
  "sections": {
    "产品概述": "产品概述...",
    "功能需求": "功能需求..."
  },
  "features": [
    "功能1",
    "功能2"
  ],
  "user_stories": [
    "作为员工，我想打卡签到，以便记录工作时间"
  ]
}
```

## Troubleshooting

### "File is not a valid DOCX file"
- Ensure the file is actually a DOCX file (not corrupted)
- DOCX files should open as ZIP archives

### "Could not find document.xml"
- File might be a different Office format (.doc, .xlsx, etc.)
- DOCX files specifically require this structure

### Chinese characters showing as corrupted
- Ensure Python is using UTF-8 encoding
- Use `-c utf-8` environment variable: `PYTHONIOENCODING=utf-8 python3 parse_prd.py file.docx`

## Implementation Notes for App Development

When building the Daily Check-in PWA based on the extracted requirements:

1. **User Stories** provide the functional baseline
2. **Features** list key capabilities to implement
3. **Sections** contain technical and business context
4. **Requirements** in JSON format can be used as a checklist

The extracted data helps bridge the gap between PRD documentation and development implementation.

## License

These utilities are provided as part of the Daily Check-in PWA project.
