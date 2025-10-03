#!/usr/bin/env python3
"""
Script to fix internal doc links ending with '/' by appending 'index.md'
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

def process_markdown_file(file_path: Path) -> Dict:
    """Process a markdown file and fix internal links ending with '/'"""
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
        
        # Check if it's an internal link ending with '/' (but not just '/')
        if is_internal_link(link_url) and link_url.endswith('/') and len(link_url) > 1:
            new_url = link_url + 'index.md'
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
    parser = argparse.ArgumentParser(description='Fix internal doc links ending with \'/\' by appending \'index.md\'')
    parser.add_argument('--docs-dir', default='public-site/docs', help='Path to docs directory (default: public-site/docs)')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be changed without modifying files')
    
    args = parser.parse_args()

    docs_path = Path(args.docs_dir)
    
    if not docs_path.exists():
        print(f"Error: Docs path '{docs_path}' does not exist")
        return 1
    
    print(f"Scanning for internal links ending with '/' in: {docs_path}")
    
    if args.dry_run:
        print("DRY RUN MODE - No files will be modified")
    
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
