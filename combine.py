import os

# Specify folders and files to skip
skip_folders = {'node_modules', '.next', '.git', 'components/ui'}
skip_files = {
    '.gitattributes', '.env.local', '.eslintrc.json', '.firebaserc',
    '.gitignore', 'components.json', 'database.rules.json', 'firebase.json',
    'firestore.indexes.json', 'firestore.rules', 'folder_structure.txt',
    'next-env.d.ts', 'next.config.ts', 'package-lock.json', 'package.json',
    'postcss.config.mjs', 'README.md', 'script.py', 'storage.rules',
    'tailwind.config.ts', 'tsconfig.json', "filestructure.py", "combine.py"
}

# Output file names
output_components = "combined_components.txt"
output_others = "combined_others.txt"

# Function to ensure directory exists for the output file
def ensure_directory(file_path):
    directory = os.path.dirname(file_path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

# Function to write the contents of all files in a directory to two separate output files
def write_combined_file_content(start_path, output_components, output_others):
    # Ensure output directories exist
    ensure_directory(output_components)
    ensure_directory(output_others)

    with open(output_components, "w", encoding="utf-8") as components_output, \
         open(output_others, "w", encoding="utf-8") as others_output:

        for root, dirs, files in os.walk(start_path):
            # Skip specified folders, including any 'components/ui' subdirectory
            if any(skip in root for skip in skip_folders) or 'components/ui' in root.replace("\\", "/"):
                continue

            # Filter out specified files
            files = [f for f in files if f not in skip_files]

            for file in files:
                file_path = os.path.join(root, file)
                # Determine which output file to write to based on folder path
                output = components_output if 'components' in root.replace("\\", "/") else others_output

                # Write the file header and contents
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

    print(f"Combined component files created: {output_components}")
    print(f"Combined other files created: {output_others}")

# Example usage
write_combined_file_content(
    r'C:\Users\Clive\Documents\GitHub\my-app', 
    r'C:\Users\Clive\Documents\combined_components.txt',
    r'C:\Users\Clive\Documents\combined_others.txt'
)
