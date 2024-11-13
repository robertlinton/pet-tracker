import os

# Specify the folders and files to skip
skip_folders = {'node_modules', '.next', '.git'}
skip_files = {
    '.gitattributes', '.env.local', '.eslintrc.json', '.firebaserc',
    '.gitignore', 'components.json', 'database.rules.json', 'firebase.json',
    'firestore.indexes.json', 'firestore.rules', 'folder_structure.txt',
    'next-env.d.ts', 'next.config.ts', 'package-lock.json', 'package.json',
    'postcss.config.mjs', 'README.md', 'script.py', 'storage.rules',
    'tailwind.config.ts', 'tsconfig.json', "filestructure.py","combine.py"
}

# Output file name
output_file = "combined_files.txt"

# Function to ensure directory exists for the output file
def ensure_directory(file_path):
    directory = os.path.dirname(file_path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

# Function to write the contents of all files in a directory to an output file
def write_combined_file_content(start_path, output_file):
    # Ensure output directory exists
    ensure_directory(output_file)

    with open(output_file, "w", encoding="utf-8") as output:
        for root, dirs, files in os.walk(start_path):
            # Skip specified folders
            if any(skip in root for skip in skip_folders):
                continue

            # Filter out specified files
            files = [f for f in files if f not in skip_files]

            for file in files:
                file_path = os.path.join(root, file)
                output.write("=" * 40 + "\n")
                output.write(f"{file_path}\n")
                output.write("=" * 40 + "\n")

                try:
                    # Read and write file content
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    output.write(content + "\n\n")
                except Exception as e:
                    # Handle any read errors
                    output.write(f"// Error reading file: {e}\n\n")
                    print(f"Error reading {file_path}: {e}")

    print(f"Combined file created: {output_file}")

# Example usage
write_combined_file_content(
    r'C:\Users\Clive\Documents\GitHub\my-app', 
    r'C:\Users\Clive\Documents\combined_files.txt'
)
