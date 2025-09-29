#!/usr/bin/env python3
"""
This is a simple test script to verify that the convert_admonitions.py script works correctly.
It creates a temporary file with Docusaurus admonitions, runs the conversion script on it,
and then checks that the result is what we expect.
"""

import os
import tempfile
import subprocess
import sys
from pathlib import Path

# Import the conversion script
sys.path.append(str(Path(__file__).parent))
from convert_admonitions import convert_file

# Create a temporary test file with Docusaurus admonitions
def create_test_file(test_content):
    """Create a temporary file with test content and return its path."""
    fd, path = tempfile.mkstemp(suffix=".md")
    with os.fdopen(fd, 'w') as f:
        f.write(test_content)
    return path

# Define test cases
test_cases = [
    {
        "name": "Basic tip admonition",
        "input": "# Test Document\n\n:::tip\nThis is a tip\n:::\n\nMore content\n",
        "expected": "# Test Document\n\n!!! tip\n    This is a tip\n\nMore content\n"
    },
    {
        "name": "Admonition with title",
        "input": ":::note Custom Title\nThis is a note with a title\n:::\n",
        "expected": "!!! note \"Custom Title\"\n    This is a note with a title\n"
    },
    {
        "name": "Multiple admonitions",
        "input": ":::tip\nTip content\n:::\n\n:::info\nInfo content\n:::\n\n:::caution\nCaution content\n:::\n",
        "expected": "!!! tip\n    Tip content\n\n!!! info\n    Info content\n\n!!! warning\n    Caution content\n"
    },
    {
        "name": "Admonition with multiple paragraphs",
        "input": ":::info\nParagraph 1\n\nParagraph 2\n:::\n",
        "expected": "!!! info\n    Paragraph 1\n    \n    Paragraph 2\n"
    }
]

def run_tests():
    """Run all test cases and report results."""
    passed = 0
    failed = 0
    
    for test_case in test_cases:
        print(f"\nRunning test: {test_case['name']}")
        
        # Create test file
        test_file_path = create_test_file(test_case["input"])
        
        try:
            # Run conversion
            convert_file(test_file_path)
            
            # Read the result - don't strip trailing newlines
            with open(test_file_path, 'r') as f:
                result = f.read()
            
            # Compare with expected
            expected = test_case["expected"]
            if result == expected:
                print(f"✅ PASS: {test_case['name']}")
                passed += 1
            else:
                print(f"❌ FAIL: {test_case['name']}")
                print(f"Expected:\n{expected}")
                print(f"Got:\n{result}")
                failed += 1
                
        finally:
            # Clean up
            os.unlink(test_file_path)
    
    print(f"\nTest results: {passed} passed, {failed} failed")
    return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)