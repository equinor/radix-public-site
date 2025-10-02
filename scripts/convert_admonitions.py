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

import re
import glob
import argparse

# Regular expression patterns to find Docusaurus admonitions
ADMONITION_START_PATTERN = re.compile(r'^(\s*):::(\w+)(?:\s+(.+?))?$')
ADMONITION_END_PATTERN = re.compile(r'^(\s*):::$')

def process_file_content(lines):
    new_lines = []
    i = 0
    in_admonition = False
    admonition_content = []
    current_admonition_title = None
    has_admonitions = False  # Flag to track if we found any admonitions
    
    while i < len(lines):
        line = lines[i].rstrip('\n')
        
        if not in_admonition:
            # Look for the start of an admonition
            start_match = ADMONITION_START_PATTERN.match(line)
            if start_match:
                has_admonitions = True  # Found at least one admonition
                in_admonition = True
                
                indent = start_match.group(1) or ''  # Capture indentation (if any)
                admonition_type = start_match.group(2)
                
                # Map Docusaurus admonition types to MkDocs types
                # MkDocs uses: tip, note, info, warning, danger, etc.
                if admonition_type == 'caution':
                    admonition_type = 'warning'
                
                current_admonition_title = start_match.group(3)
                
                # Add the MkDocs-style admonition line - MkDocs requires admonitions to start at the beginning of the line
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
                # MkDocs requires 4-space indentation for admonition content, regardless of original indentation
                for content_line in admonition_content:
                    new_lines.append(f'    {content_line}')
                
                # Reset for the next admonition
                in_admonition = False
                admonition_content = []
                current_admonition_title = None
            else:
                # Collect admonition content
                admonition_content.append(line)
        
        i += 1
    
    # Handle case where a file ends inside an admonition (shouldn't happen, but just in case)
    if in_admonition:
        for content_line in admonition_content:
            new_lines.append(f'    {content_line}')
    return new_lines,has_admonitions


def convert_file(file_path):
    """
    Convert Docusaurus admonitions to MkDocs admonitions in a single file.
    
    Args:
        file_path: Path to the markdown file to convert
       
    """
    print(f"Processing {file_path}")
    
    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as f:
        original_content = f.read()
        # Reset file pointer and read lines
        f.seek(0)
        lines = f.readlines()
    
    new_lines, has_admonitions = process_file_content(lines)
    
    # Only write back to the file if we found admonitions and made changes
    if has_admonitions:
        # Generate new content
        new_content = '\n'.join(new_lines)
            
        # Check if content actually changed
        if new_content != original_content:
            print(f"  File was modified - writing changes")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return
        else:
            print(f"  File had admonitions but content didn't change - skipping write")
    else:
        print(f"  No admonitions found - skipping file")

def convert_files_in_directory(docs_dir):
    """
    Convert all markdown files in a directory and its subdirectories.
    
    Args:
        docs_dir: Path to the documentation directory
    """
    # Process all markdown files in the directory and subdirectories
    md_files = glob.glob(f"{docs_dir}/**/*.md", recursive=True)
    
    total_files = len(md_files)
    
    print(f"Found {total_files} markdown files to process")
    
    for file_path in md_files:
        convert_file(file_path)
   

def main():
    """
    Main entry point for the script.
    
    Returns:
        int: Exit code - 0 for success, 1 for error
    """
    parser = argparse.ArgumentParser(
        description='Convert Docusaurus-style admonitions to MkDocs-style admonitions'
    )
    parser.add_argument(
        '--docs-dir', 
        default='./public-site/docs',
        help='Path to the documentation directory (default: ./public-site/docs)'
    )
    parser.add_argument(
        '--exit-code-on-change',
        action='store_true',
        help='Exit with code 1 if any files were modified, 0 otherwise'
    )
    
    args = parser.parse_args()
    convert_files_in_directory(args.docs_dir)
    
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())