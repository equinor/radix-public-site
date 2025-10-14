#!/bin/bash
# Preprocess markdown files for MkDocs

echo "Converting admonitions from Docusaurus format to MkDocs format..."
python ./scripts/convert_admonitions.py --docs-dir ./docs

echo "Fix urls ending with '/' to make them valid in MkDocs..."
python ./scripts/fix_doc_links.py --docs-path ./docs

echo "Copying images for MkDocs..."
cp -r ./static/images/ ./docs/

echo "Copy MkDocs variant homepage to docs folder..."
cp ./scripts/md-files/docs_index.md ./docs/index.md

echo "Replace the <RadixTeam /> tag in community/index.md ..."
sed -i -e '/<RadixTeam \/>/r ./scripts/md-files/RadixTeam.md' -e '/<RadixTeam \/>/d' ./docs/community/index.md

echo "MkDocs preprocessing complete."
