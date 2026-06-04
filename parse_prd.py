#!/usr/bin/env python3
"""
PRD Parser for Daily Check-in PWA
Extracts and structures requirements from DOCX files
"""

import zipfile
import re
import json
from pathlib import Path
from typing import Dict, List, Any


class PRDParser:
    def __init__(self, docx_path: str):
        self.docx_path = docx_path
        self.text = None
        self.sections = {}

    def extract_raw_text(self) -> str:
        """Extract raw text from DOCX"""
        try:
            with zipfile.ZipFile(self.docx_path, 'r') as z:
                with z.open('word/document.xml') as f:
                    content = f.read().decode('utf-8')
                    # Extract text nodes (content between <w:t> tags)
                    text_pattern = r'<w:t[^>]*>(.*?)</w:t>'
                    texts = re.findall(text_pattern, content)
                    full_text = ' '.join(texts)
                    # Clean up excessive whitespace
                    full_text = re.sub(r'\s+', ' ', full_text)
                    self.text = full_text.strip()
                    return self.text
        except Exception as e:
            print(f"Error extracting text: {e}")
            return None

    def parse_sections(self) -> Dict[str, str]:
        """Parse text into logical sections"""
        if not self.text:
            return {}

        # Common PRD section headers
        section_patterns = {
            '产品概述': r'产品概述.*?(?=产品|功能|用户|市场|竞争|技术|项目)',
            '功能需求': r'功能需求.*?(?=用户|非功能|技术|业务|界面|用户故事)',
            '用户故事': r'用户故事.*?(?=界面|功能|技术|非功能)',
            '界面需求': r'界面需求|UI需求.*?(?=技术|非功能|其他)',
            '用户流程': r'用户流程|用户旅程.*?(?=功能|界面|技术)',
            '技术要求': r'技术要求|技术架构.*?(?=非功能|安全|部署)',
            '非功能需求': r'非功能需求|性能需求.*?(?=技术|安全|其他)',
            '业务需求': r'业务需求|商业目标.*?(?=功能|用户|市场)',
        }

        for section_name, pattern in section_patterns.items():
            match = re.search(pattern, self.text, re.IGNORECASE | re.DOTALL)
            if match:
                self.sections[section_name] = match.group(0)[:500]  # Truncate for display

        return self.sections

    def extract_features(self) -> List[str]:
        """Extract feature descriptions"""
        if not self.text:
            return []

        # Look for common feature indicators
        features = []

        # Pattern 1: "功能: ..."
        pattern1 = r'功能[：:]\s*([^；。\n]+)'
        matches = re.findall(pattern1, self.text)
        features.extend(matches)

        # Pattern 2: "支持..."
        pattern2 = r'支持([^；。\n]+)'
        matches = re.findall(pattern2, self.text)
        features.extend(matches[:5])  # Limit to avoid duplication

        # Pattern 3: Bullet points with Chinese checklist symbols
        pattern3 = r'[•◆◇▪▬▭]\s*([^；。\n]+)'
        matches = re.findall(pattern3, self.text)
        features.extend(matches[:5])

        return list(set(features))[:10]  # Remove duplicates, limit to 10

    def extract_user_stories(self) -> List[str]:
        """Extract user stories in format: 作为...我想...以便..."""
        if not self.text:
            return []

        stories = []

        # Pattern: 作为[用户类型]，我想[功能]，以便[受益]
        pattern = r'作为([^，，]+)[，,]\s*我想([^，，]+)[，,]\s*以便([^；。\n]+)'
        matches = re.findall(pattern, self.text)

        for user_type, feature, benefit in matches:
            story = f"作为{user_type}，我想{feature}，以便{benefit}"
            stories.append(story)

        return stories

    def extract_requirements(self) -> Dict[str, Any]:
        """Extract and structure all requirements"""
        if not self.text:
            self.extract_raw_text()

        return {
            'title': self._extract_title(),
            'sections': self.parse_sections(),
            'features': self.extract_features(),
            'user_stories': self.extract_user_stories(),
            'raw_text_preview': self.text[:1000] if self.text else None,
        }

    def _extract_title(self) -> str:
        """Extract document title"""
        if not self.text:
            return "Unknown"

        # Look for common title patterns
        title_pattern = r'^([^。；\n]{5,50}PRD[^\n]*)'
        match = re.search(title_pattern, self.text, re.IGNORECASE)
        if match:
            return match.group(1).strip()

        # Default: first 50 characters
        return self.text[:50]

    def save_analysis(self, output_file: str = None):
        """Save analysis to JSON file"""
        if not output_file:
            output_file = Path(self.docx_path).stem + "_analysis.json"

        analysis = self.extract_requirements()

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)

        return output_file


def main():
    import sys

    if len(sys.argv) < 2:
        print("Usage: python3 parse_prd.py <path_to_docx_file>")
        print("\nExample: python3 parse_prd.py 每日打卡PWA_PRD_V2.0.docx")
        sys.exit(1)

    docx_file = sys.argv[1]

    if not Path(docx_file).exists():
        print(f"Error: File '{docx_file}' not found")
        sys.exit(1)

    print(f"Parsing PRD from: {docx_file}\n")

    parser = PRDParser(docx_file)
    parser.extract_raw_text()

    print("=" * 80)
    print("DOCUMENT ANALYSIS")
    print("=" * 80)

    requirements = parser.extract_requirements()

    print(f"\nTitle: {requirements['title']}\n")

    print("SECTIONS FOUND:")
    for section, content in requirements['sections'].items():
        print(f"  - {section}: {content[:100]}...")

    print("\n\nFEATURES IDENTIFIED:")
    for i, feature in enumerate(requirements['features'], 1):
        print(f"  {i}. {feature}")

    print("\n\nUSER STORIES:")
    for i, story in enumerate(requirements['user_stories'], 1):
        print(f"  {i}. {story}")

    print(f"\n\nRAW TEXT PREVIEW (first 500 chars):")
    print(requirements['raw_text_preview'][:500])

    # Save analysis
    output_file = parser.save_analysis()
    print(f"\n\nAnalysis saved to: {output_file}")


if __name__ == "__main__":
    main()
