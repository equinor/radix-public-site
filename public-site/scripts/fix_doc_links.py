#!/usr/bin/env python3
"""
Script to fix internal doc links by appending 'index.md' to:
1. Links ending with '/'
2. Links not ending with a file extension (and not containing fragments/anchors)
"""

import os
import re
import argparse
from pathlib import Path
from typing import List, Dict, Tuple

def is_internal_link(link: str) -> bool:
    """Check if a link is internal (relative)"""
    return not (
        link.startswith(('http://', 'https://')) or
        link.startswith('mailto:') or
        link.startswith('#')
    )

def has_file_extension(path: str) -> bool:
    """Check if the path has a file extension"""
    # Remove fragment/anchor part if present
    path_without_fragment = path.split('#')[0]
    # Check if the last part after '/' has a dot (indicating file extension)
    return '.' in Path(path_without_fragment).name

def should_fix_link(link_url: str) -> bool:
    """Determine if a link should be fixed"""
    if not is_internal_link(link_url):
        return False
    
    # Case 1: Links ending with '/' (but not just '/')
    if link_url.endswith('/') and len(link_url) > 1:
        return True
    
    # Case 2: Links not ending with file extension and not having fragment-only links
    if not link_url.startswith('#') and not has_file_extension(link_url):
        return True
    
    return False

def fix_link_url(link_url: str) -> str:
    """Fix the link URL by appending index.md appropriately"""
    # Split URL into path and fragment parts
    if '#' in link_url:
        path_part, fragment_part = link_url.split('#', 1)
        fragment = '#' + fragment_part
    else:
        path_part = link_url
        fragment = ''
    
    # Case 1: Path ends with '/'
    if path_part.endswith('/'):
        new_path = path_part + 'index.md'
    # Case 2: Path doesn't have file extension
    elif not has_file_extension(path_part):
        new_path = path_part + '/index.md'
    else:
        return link_url  # No change needed
    
    return new_path + fragment

def process_markdown_file(file_path: Path) -> Dict:
    """Process a markdown file and fix internal links"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return {'content': '', 'changes': [], 'has_changes': False}
    
    original_content = content
    changes = []
    
    # Regex pattern to match markdown links [text](url)
    link_pattern = r'\[([^\]]*)\]\(([^)]+)\)'
    
    def replace_link(match):
        link_text = match.group(1)
        link_url = match.group(2)
        
        if should_fix_link(link_url):
            new_url = fix_link_url(link_url)
            old_link = match.group(0)
            new_link = f"[{link_text}]({new_url})"
            
            changes.append({
                'file': str(file_path),
                'original': old_link,
                'new': new_link,
                'url': link_url,
                'new_url': new_url
            })
            
            return new_link
        
        return match.group(0)
    
    new_content = re.sub(link_pattern, replace_link, content)
    
    return {
        'content': new_content,
        'changes': changes,
        'has_changes': new_content != original_content
    }

def main():
    parser = argparse.ArgumentParser(description='Fix internal doc links by appending index.md')
    parser.add_argument('--docs-path', default='public-site/docs', help='Path to docs directory (default: public-site/docs)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be changed without modifying files')
    
    args = parser.parse_args()
    
    docs_path = Path(args.docs_path)
    
    if not docs_path.exists():
        print(f"Error: Docs path '{docs_path}' does not exist")
        return 1
    
    print(f"Scanning for internal links to fix in: {docs_path}")
    print("Will fix:")
    print("  1. Links ending with '/' by appending 'index.md'")
    print("  2. Links without file extensions by appending '/index.md'")
    
    if args.dry_run:
        print("\nDRY RUN MODE - No files will be modified")
    
    all_changes = []
    files_processed = 0
    files_changed = 0
    
    # Get all markdown files recursively
    markdown_files = list(docs_path.rglob("*.md"))
    
    for file_path in markdown_files:
        files_processed += 1
        print(f"Processing ({files_processed}/{len(markdown_files)}): {file_path.name}", end='\r')
        
        result = process_markdown_file(file_path)
        
        if result['has_changes']:
            files_changed += 1
            all_changes.extend(result['changes'])
            
            if not args.dry_run:
                try:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(result['content'])
                    print(f"\nUpdated: {file_path}")
                except Exception as e:
                    print(f"\nError writing {file_path}: {e}")
    
    print(f"\n\nSummary:")
    print(f"Files processed: {files_processed}")
    print(f"Files with changes: {files_changed}")
    print(f"Total links fixed: {len(all_changes)}")
    
    if all_changes:
        print(f"\nChanges made:")
        for change in all_changes:
            # Get relative path for cleaner output
            try:
                relative_path = Path(change['file']).relative_to(Path.cwd())
            except ValueError:
                relative_path = Path(change['file'])
            
            print(f"  {relative_path}")
            print(f"    {change['url']} -> {change['new_url']}")
    
    if args.dry_run and all_changes:
        print(f"\nTo apply these changes, run the script without --dry-run")
    
    return 0

if __name__ == "__main__":
    exit(main())
    