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

# Iterate over each file path and add the corresponding file name as a comment
for file_path, file_name in file_paths.items():
    # Check if the file exists
    if os.path.isfile(file_path):
        # Read the contents of the file
        with open(file_path, "r") as file:
            content = file.read()

        # Add the file name as a comment at the beginning of the file
        content = file_name + "\n\n" + content

        # Write the updated content back to the file
        with open(file_path, "w") as file:
            file.write(content)
    else:
        print(f"File not found: {file_path}")