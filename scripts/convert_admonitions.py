#!/usr/bin/env python3
"""
This script converts Docusaurus-style admonitions to MkDocs-style admonitions.
It processes all Markdown files in the specified directory.

Conversion examples:
- :::tip => !!! tip
- :::note => !!! note
- :::info => !!! info
- :::caution => !!! warning
- :::danger => !!! danger

It also handles custom titles and properly indents content.
"""

import os
import re
import glob
import argparse
from pathlib import Path

# Regular expression patterns to find Docusaurus admonitions
ADMONITION_START_PATTERN = re.compile(r'^:::(\w+)(?:\s+(.+?))?$')
ADMONITION_END_PATTERN = re.compile(r'^:::$')

def convert_file(file_path):
    """
    Convert Docusaurus admonitions to MkDocs admonitions in a single file.
    
    Args:
        file_path: Path to the markdown file to convert
    """
    print(f"Processing {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    i = 0
    in_admonition = False
    admonition_content = []
    current_admonition_type = None
    current_admonition_title = None
    
    while i < len(lines):
        line = lines[i].rstrip('\n')
        
        if not in_admonition:
            # Look for the start of an admonition
            start_match = ADMONITION_START_PATTERN.match(line)
            if start_match:
                in_admonition = True
                admonition_type = start_match.group(1)
                
                # Map Docusaurus admonition types to MkDocs types
                # MkDocs uses: tip, note, info, warning, danger, etc.
                if admonition_type == 'caution':
                    admonition_type = 'warning'
                
                current_admonition_type = admonition_type
                current_admonition_title = start_match.group(2)
                
                # Add the MkDocs-style admonition line
                if current_admonition_title:
                    new_lines.append(f'!!! {admonition_type} "{current_admonition_title}"')
                else:
                    new_lines.append(f'!!! {admonition_type}')
            else:
                new_lines.append(line)
        else:
            # Look for the end of the admonition
            end_match = ADMONITION_END_PATTERN.match(line)
            if end_match:
                # Add all collected content with proper indentation
                for content_line in admonition_content:
                    new_lines.append(f'    {content_line}')
                
                # Reset for the next admonition
                in_admonition = False
                admonition_content = []
                current_admonition_type = None
                current_admonition_title = None
            else:
                # Collect admonition content
                admonition_content.append(line)
        
        i += 1
    
    # Handle case where a file ends inside an admonition (shouldn't happen, but just in case)
    if in_admonition:
        for content_line in admonition_content:
            new_lines.append(f'    {content_line}')
    
    # Write the modified content back to the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

def convert_directory(docs_dir):
    """
    Convert all markdown files in a directory and its subdirectories.
    
    Args:
        docs_dir: Path to the documentation directory
    """
    # Process all markdown files in the directory and subdirectories
    md_files = glob.glob(f"{docs_dir}/**/*.md", recursive=True)
    
    print(f"Found {len(md_files)} markdown files to process")
    
    for file_path in md_files:
        convert_file(file_path)
    
    print("Conversion complete!")

def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description='Convert Docusaurus-style admonitions to MkDocs-style admonitions'
    )
    parser.add_argument(
        '--docs-dir', 
        default='./public-site/docs',
        help='Path to the documentation directory (default: ./public-site/docs)'
    )
    
    args = parser.parse_args()
    convert_directory(args.docs_dir)

if __name__ == '__main__':
    main()