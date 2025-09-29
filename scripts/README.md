# Documentation Conversion Scripts

This directory contains scripts for converting between different documentation formats.

## `convert_admonitions.py`

Converts Docusaurus-style admonitions to MkDocs-style admonitions in Markdown files.

### Usage

```bash
python scripts/convert_admonitions.py --docs-dir ./public-site/docs
```

#### Examples of conversions:

| Docusaurus Syntax | MkDocs Syntax |
|-------------------|---------------|
| `:::tip` | `!!! tip` |
| `:::note` | `!!! note` |
| `:::info` | `!!! info` |
| `:::caution` | `!!! warning` |
| `:::danger` | `!!! danger` |

### How it works

The script processes all Markdown files in the specified directory and its subdirectories:

1. It looks for lines that start with `:::` followed by an admonition type (tip, note, info, etc.)
2. It converts these to the MkDocs format (`!!!`)
3. It properly handles titles and content indentation
4. It maps Docusaurus admonition types to their MkDocs equivalents

## `test_admonition_conversion.py`

Tests that the `convert_admonitions.py` script works correctly.

### Usage

```bash
python scripts/test_admonition_conversion.py
```

This script creates temporary files with various test cases of Docusaurus admonitions, runs the conversion script on them, and verifies that the output matches what's expected.