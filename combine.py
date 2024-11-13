import os

# Dictionary of file paths and their corresponding placeholder comments
file_paths = {
    "app/layout.tsx": "// app/layout.tsx",
    "app/not-found.tsx": "// app/not-found.tsx",
    "app/page.tsx": "// app/page.tsx",
    "app/dashboard/page.tsx": "// app/dashboard/page.tsx",
    "app/pets/[id]/error.tsx": "// app/pets/[id]/error.tsx",
    "app/pets/[id]/layout.tsx": "// app/pets/[id]/layout.tsx",
    "app/pets/[id]/loading.tsx": "// app/pets/[id]/loading.tsx",
    "app/pets/[id]/not-found.tsx": "// app/pets/[id]/not-found.tsx",
    "app/pets/[id]/page.tsx": "// app/pets/[id]/page.tsx",
    "components/AddPetDialog.tsx": "// components/AddPetDialog.tsx",
    "components/EditPetDialog.tsx": "// components/EditPetDialog.tsx",
    "components/Sidebar.tsx": "// components/Sidebar.tsx",
    "components/ui/alert-dialog.tsx": "// components/ui/alert-dialog.tsx",
    "components/ui/avatar.tsx": "// components/ui/avatar.tsx",
    "components/ui/button.tsx": "// components/ui/button.tsx",
    "components/ui/card.tsx": "// components/ui/card.tsx",
    "components/ui/dialog.tsx": "// components/ui/dialog.tsx",
    "components/ui/form.tsx": "// components/ui/form.tsx",
    "components/ui/input.tsx": "// components/ui/input.tsx",
    "components/ui/label.tsx": "// components/ui/label.tsx",
    "components/ui/loading.tsx": "// components/ui/loading.tsx",
    "components/ui/scroll-area.tsx": "// components/ui/scroll-area.tsx",
    "components/ui/select.tsx": "// components/ui/select.tsx",
    "components/ui/skeleton.tsx": "// components/ui/skeleton.tsx",
    "components/ui/tabs.tsx": "// components/ui/tabs.tsx",
    "components/ui/toast.tsx": "// components/ui/toast.tsx",
    "components/ui/toaster.tsx": "// components/ui/toaster.tsx",
    "hooks/use-toast.ts": "// hooks/use-toast.ts",
    "lib/firebase.ts": "// lib/firebase.ts",
    "lib/utils.ts": "// lib/utils.ts",
    "lib/schemas/pet.ts": "// lib/schemas/pet.ts",
    "styles/globals.css": "// styles/globals.css",
    "types/index.ts": "// types/index.ts"
}

# Output file name
output_file = "combined_files.txt"

# Function to ensure directory exists for the output file
def ensure_directory(file_path):
    directory = os.path.dirname(file_path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

# Open the output file in write mode
with open(output_file, "w", encoding="utf-8") as output:
    # Iterate over each file path
    for file_path, placeholder in file_paths.items():
        # Write a separator and the file path as a heading
        output.write("=" * 40 + "\n")
        output.write(f"{file_path}\n")
        output.write("=" * 40 + "\n")

        # Check if the file exists
        if os.path.isfile(file_path):
            try:
                # Read the contents of the file
                with open(file_path, "r", encoding="utf-8") as file:
                    content = file.read()
                # Write the file content to the output file
                output.write(content + "\n\n")
            except Exception as e:
                # Handle any unexpected errors while reading the file
                output.write(f"// Error reading file: {e}\n\n")
                print(f"Error reading {file_path}: {e}")
        else:
            # Write the placeholder comment if the file does not exist
            output.write(f"{placeholder}\n\n")
            print(f"File not found: {file_path}")

print(f"Combined file created: {output_file}")
