import os
import shutil
from pathlib import Path

def copy_images_for_mkdocs():
    """Copy images from various locations to make them accessible for MkDocs build"""
    
    # Define source and target directories
    project_root = Path(__file__).parent.parent
    source_dirs = [
        project_root / "public-site" / "static" / "images"
    ]
    target_dir = project_root / "docs" / "images"
    
    # Create target directory if it doesn't exist
    target_dir.mkdir(parents=True, exist_ok=True)
    print(f"Target directory: {target_dir}")
    
    # Copy images from all source directories
    for source_dir in source_dirs:
        if source_dir.exists():
            print(f"Copying from: {source_dir}")
            for item in source_dir.iterdir():
                if item.is_file():
                    target_file = target_dir / item.name
                    shutil.copy2(item, target_file)
                    print(f"  Copied: {item.name}")
                elif item.is_dir():
                    target_subdir = target_dir / item.name
                    if target_subdir.exists():
                        shutil.rmtree(target_subdir)
                    shutil.copytree(item, target_subdir)
                    print(f"  Copied directory: {item.name}")
        else:
            print(f"Source directory not found: {source_dir}")
    
    print("Image copying complete!")

if __name__ == "__main__":
    copy_images_for_mkdocs()