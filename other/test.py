import os

# Dictionary of file paths and their corresponding file names
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

# Open the output file in write mode
with open(output_file, "w") as output:
    # Iterate over each file path
    for file_path in file_paths.keys():
        # Check if the file exists
        if os.path.isfile(file_path):
            # Read the contents of the file
            with open(file_path, "r") as file:
                content = file.read()

            # Write the file name as a heading in the output file
            output.write("=" * 40 + "\n")
            output.write(file_path + "\n")
            output.write("=" * 40 + "\n")

            # Write the file content to the output file
            output.write(content + "\n\n")
        else:
            print(f"File not found: {file_path}")

print(f"Combined file created: {output_file}")