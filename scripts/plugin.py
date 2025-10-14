"""
MkDocs Docusaurus plugin hooks for preprocessing content
"""

import re
import logging
from pathlib import Path

from mkdocs.plugins import BasePlugin

class DocusaurusPlugin(BasePlugin):
    def __init__(self):
        super().__init__()
        print("INFO    -  DocusaurusPlugin loaded successfully (className conversion + doc link fixing + admonition conversion)")    
    def on_page_markdown(self, markdown, page, config, files, **kwargs):
        """
        Hook to preprocess markdown content before it's converted to HTML.
        This automatically converts className to class in all pages, fixes doc links, and converts admonitions.
        """
        markdown = self.parseClassNames(markdown)
        markdown = self.fixDocLinks(markdown)
        markdown = self.convertAdmonitions(markdown)
        return markdown
    
    def parseClassNames(self, markdown: str) -> str:
        """
        Convert className attributes to class attributes in HTML elements.
        
        Args:
            markdown: The markdown content as a string
            
        Returns:
            Updated markdown content with className converted to class
        """
        patterns = [
            (r'\bclassName="([^"]*)"', r'class="\1"'),
            (r"\bclassName='([^']*)'", r"class='\1'"), 
            (r'\bclassName=\{([^}]*)\}', r'class="\1"'),
        ]
        
        result = markdown
        for pattern, replacement in patterns:
            result = re.sub(pattern, replacement, result)
        return result

    def fixDocLinks(self, markdown: str) -> str:
        """
        Fix internal doc links by appending 'index.md' to:
        1. Links ending with '/'
        2. Links not ending with a file extension (and not containing fragments/anchors)
        
        Args:
            markdown: The markdown content as a string
            
        Returns:
            Updated markdown content with fixed links
        """
        # Regex pattern to match markdown links [text](url)
        link_pattern = r'\[([^\]]*)\]\(([^)]+)\)'
        
        def replace_link(match):
            link_text = match.group(1)
            link_url = match.group(2)
            
            if self._should_fix_link(link_url):
                new_url = self._fix_link_url(link_url)
                return f"[{link_text}]({new_url})"
            
            return match.group(0)
        
        return re.sub(link_pattern, replace_link, markdown)

    def _is_internal_link(self, link: str) -> bool:
        """Check if a link is internal (relative)"""
        return not (
            link.startswith(('http://', 'https://')) or
            link.startswith('mailto:') or
            link.startswith('#')
        )

    def _has_file_extension(self, path: str) -> bool:
        """Check if the path has a file extension"""
        # Remove fragment/anchor part if present
        path_without_fragment = path.split('#')[0]
        # Check if the last part after '/' has a dot (indicating file extension)
        return '.' in Path(path_without_fragment).name

    def _should_fix_link(self, link_url: str) -> bool:
        """Determine if a link should be fixed"""
        if not self._is_internal_link(link_url):
            return False
        
        # Case 1: Links ending with '/' (but not just '/')
        if link_url.endswith('/') and len(link_url) > 1:
            return True
        
        # Case 2: Links not ending with file extension and not having fragment-only links
        if not link_url.startswith('#') and not self._has_file_extension(link_url):
            return True
        
        return False

    def _fix_link_url(self, link_url: str) -> str:
        """Fix the link URL by appending index.md appropriately"""
        # Split URL into path and fragment parts
        if '#' in link_url:
            path_part, fragment_part = link_url.split('#', 1)
            fragment = '#' + fragment_part
        else:
            path_part = link_url
            fragment = ''
        
        # Case 1: Path ends with '/' - append index.md
        if path_part.endswith('/'):
            new_path = path_part + 'index.md'
        # Case 2: Path doesn't have file extension - try .md first, then /index.md
        elif not self._has_file_extension(path_part):
            # For most cases, try adding .md first (for files like job-manager-and-job-api.md)
            # But for directory-like paths, use /index.md
            if '/' in path_part and not path_part.endswith('/'):
                # Check if this looks like a file path vs directory path
                path_segments = path_part.split('/')
                last_segment = path_segments[-1]
                
                # Count actual path segments (excluding empty string from leading /)
                actual_segments = [seg for seg in path_segments if seg]
                
                # If it's a single segment path (like /radix-config) and has fragment, add /index.md
                if len(actual_segments) == 1 and fragment:
                    new_path = path_part + '/index.md'
                # If the last segment looks like a file (contains hyphens, specific patterns), add .md
                elif '-' in last_segment or last_segment in ['index', 'readme', 'README']:
                    new_path = path_part + '.md'
                else:
                    # For directory-like paths with fragments, add / before fragment
                    if fragment:
                        new_path = path_part + '/'
                    else:
                        new_path = path_part + '/index.md'
            else:
                # For simple paths like /radix-config with fragment, add / before fragment
                if fragment:
                    new_path = path_part + '/'
                else:
                    new_path = path_part + '/index.md'
        else:
            return link_url  # No change needed
        
        return new_path + fragment

    def convertAdmonitions(self, markdown: str) -> str:
        """
        Convert Docusaurus-style admonitions to MkDocs-style admonitions.
        
        Conversion examples:
        - :::tip => !!! tip
        - :::note => !!! note
        - :::info => !!! info
        - :::caution => !!! warning
        - :::danger => !!! danger
        
        Args:
            markdown: The markdown content as a string
            
        Returns:
            Updated markdown content with converted admonitions
        """
        # Regular expression patterns to find Docusaurus admonitions
        ADMONITION_START_PATTERN = re.compile(r'^(\s*):::(\w+)(?:\s+(.+?))?$')
        ADMONITION_END_PATTERN = re.compile(r'^(\s*):::$')

        lines = markdown.split('\n')
        new_lines = []
        i = 0
        in_admonition = False
        admonition_content = []
        current_admonition_title = None
        
        while i < len(lines):
            line = lines[i]
            
            if not in_admonition:
                # Look for the start of an admonition
                start_match = ADMONITION_START_PATTERN.match(line)
                if start_match:
                    in_admonition = True
                    
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
        
        # Handle case where markdown ends inside an admonition (shouldn't happen, but just in case)
        if in_admonition:
            for content_line in admonition_content:
                new_lines.append(f'    {content_line}')
        
        return '\n'.join(new_lines)