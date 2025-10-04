# !/bin/bash
# Preprocess markdown files for MkDocs

echo "Converting admonitions from Docusaurus format to MkDocs format..."
python ./public-site/scripts/convert_admonitions.py --docs-dir ./public-site/docs

echo "Fix urls ending with '/' to make them valid in MkDocs..."
python ./public-site/scripts/fix_doc_links.py --docs-path ./public-site/docs

echo "Copying images for MkDocs..."
cp -r public-site/static/images/ public-site/docs/

echo "Copy MkDocs variant homepage to docs folder..."
cp public-site/scripts/docs_index.md public-site/docs/index.md

echo "Replace the <RadixTeam /> tag in community/index.md ..."
sed -i -e '/<RadixTeam \/>/r public-site/scripts/RadixTeam.md' -e '/<RadixTeam \/>/d' public-site/docs/community/index.md

echo "MkDocs preprocessing complete."
