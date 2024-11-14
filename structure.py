import os

def generate_folder_layout(start_path, output_file):
    # Sets of folders and files to skip
    skip_folders = {'node_modules', '.next', '.git', '.vercel'}
    skip_files = {
        '.gitignore', 'README.md', 'package.json', 'package-lock.json',
        '.eslintrc.json', '.firebaserc', 'firestore.indexes.json',
        'firestore.rules', 'storage.rules', 'tailwind.config.ts', 
        'tsconfig.json', 'postcss.config.mjs', 'next-env.d.ts',
        '.env.development.local', 'database.rules.json', 'firebase.json',
        'folder_structure.txt', 'next.config.ts', 'structure.py',"combine.py", "components.json"
    }
    
    with open(output_file, 'w') as f:
        # Write the header for the root directory
        f.write(f"Project Directory Structure\n")
        f.write(f"Root: {os.path.basename(start_path)}/\n")
        f.write("=" * 40 + "\n\n")
        
        for root, dirs, files in os.walk(start_path):
            # Skip any folders in the skip_folders set
            if any(skip in root for skip in skip_folders):
                continue
            
            # Create indentation based on folder depth
            level = root.replace(start_path, '').count(os.sep)
            indent = '    ' * level
            f.write(f'{indent}- {os.path.basename(root)}/\n')
            
            # Write files with indentation, skipping specified files
            sub_indent = '    ' * (level + 1)
            for file in files:
                if file not in skip_files:
                    f.write(f'{sub_indent}- {file}\n')

# Run the function with your chosen folder path and output file name
generate_folder_layout(r'C:\Users\Clive\Documents\GitHub\my-app', 'folder_structure.txt')
