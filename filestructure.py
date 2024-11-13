import os

def generate_folder_layout(start_path, output_file):
    # Sets of folders and files to skip
    skip_folders = {'node_modules', '.next', '.git'}
    skip_files = {
        '.gitattributes', '.env.local', '.eslintrc.json', '.firebaserc',
        '.gitignore', 'components.json', 'database.rules.json', 'firebase.json',
        'firestore.indexes.json', 'firestore.rules', 'folder_structure.txt',
        'next-env.d.ts', 'next.config.ts', 'package-lock.json', 'package.json',
        'postcss.config.mjs', 'README.md', 'script.py', 'storage.rules',
        'tailwind.config.ts', 'tsconfig.json', "filestructure.py"
    }

    with open(output_file, 'w') as f:
        for root, dirs, files in os.walk(start_path):
            # Skip any folders in the skip_folders set
            if any(skip in root for skip in skip_folders):
                continue
            
            # Create indentation based on folder depth
            level = root.replace(start_path, '').count(os.sep)
            indent = ' ' * 4 * level
            f.write(f'{indent}{os.path.basename(root)}/\n')
            
            # Write files with indentation, skipping specified files
            sub_indent = ' ' * 4 * (level + 1)
            for file in files:
                if file not in skip_files:
                    f.write(f'{sub_indent}{file}\n')

# Example usage
generate_folder_layout(
    r'C:\Users\Clive\Documents\GitHub\my-app',
    r'C:\Users\Clive\Documents/my_app_structure.txt'
)
