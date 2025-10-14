# MkDocs DocusaurusPlugin 

converts docusaurus markdown files to MkDocs

### Usage

```bash
python scripts/convert_admonitions.py --docs-dir ./public-site/docs
```

#### Examples of conversions:

| Docusaurus Syntax | MkDocs Syntax |
| ----------------- | ------------- |
| `:::tip`          | `!!! tip`     |
| `:::note`         | `!!! note`    |
| `:::info`         | `!!! info`    |
| `:::caution`      | `!!! warning` |
| `:::danger`       | `!!! danger`  |

### How it works

The script processes all Markdown files in the specified directory and its subdirectories:

1. It looks for lines that start with `:::` followed by an admonition type (tip, note, info, etc.)
2. It converts these to the MkDocs format (`!!!`)
3. It properly handles titles and content indentation
4. It maps Docusaurus admonition types to their MkDocs equivalents

## `test_convert_admonitions.py`

Tests that the `convert_admonitions.py` script works correctly.

### Usage

```bash
python scripts/test_convert_admonitions.py
```

This script creates temporary files with various test cases of Docusaurus admonitions, runs the conversion script on them, and verifies that the output matches what's expected.

### Setup

These scripts use `uv` (Python Package Manager) to manage dependencies. 

Install `uv` (https://docs.astral.sh/uv/getting-started/installation):
- Linux/MacOS: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- Windows: `winget install --id=astral-sh.uv  -e`