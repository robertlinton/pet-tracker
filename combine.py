import os

# Dictionary of file paths and their corresponding placeholder comments
file_paths = {
    # App files
    "app/layout.tsx": "// app/layout.tsx",
    "app/not-found.tsx": "// app/not-found.tsx",
    "app/page.tsx": "// app/page.tsx",
    "app/api/pets/upload/route.ts": "// app/api/pets/upload/route.ts",
    "app/dashboard/page.tsx": "// app/dashboard/page.tsx",
    
    # Pet-related pages and components
    "app/pets/[id]/error.tsx": "// app/pets/[id]/error.tsx",
    "app/pets/[id]/layout.tsx": "// app/pets/[id]/layout.tsx",
    "app/pets/[id]/loading.tsx": "// app/pets/[id]/loading.tsx",
    "app/pets/[id]/not-found.tsx": "// app/pets/[id]/not-found.tsx",
    "app/pets/[id]/page.tsx": "// app/pets/[id]/page.tsx",
    "app/pets/[id]/pet-overview-client.tsx": "// app/pets/[id]/pet-overview-client.tsx",
    "app/pets/[id]/appointments/appointments-client.tsx": "// app/pets/[id]/appointments/appointments-client.tsx",
    "app/pets/[id]/appointments/page.tsx": "// app/pets/[id]/appointments/page.tsx",
    "app/pets/[id]/feeding/page.tsx": "// app/pets/[id]/feeding/page.tsx",
    "app/pets/[id]/medications/page.tsx": "// app/pets/[id]/medications/page.tsx",
    "app/pets/[id]/notes/page.tsx": "// app/pets/[id]/notes/page.tsx",
    "app/pets/[id]/weight/page.tsx": "// app/pets/[id]/weight/page.tsx",
    
    # Settings page
    "app/settings/page.tsx": "// app/settings/page.tsx",
    
    # Components
    "components/AddAppointmentDialog.tsx": "// components/AddAppointmentDialog.tsx",
    "components/AddPetDialog.tsx": "// components/AddPetDialog.tsx",
    "components/AppointmentCard.tsx": "// components/AppointmentCard.tsx",
    "components/EditAppointmentDialog.tsx": "// components/EditAppointmentDialog.tsx",
    "components/EditPetDialog.tsx": "// components/EditPetDialog.tsx",
    "components/Sidebar.tsx": "// components/Sidebar.tsx",
    
    # UI components
    "components/ui/alert-dialog.tsx": "// components/ui/alert-dialog.tsx",
    "components/ui/avatar.tsx": "// components/ui/avatar.tsx",
    "components/ui/badge.tsx": "// components/ui/badge.tsx",
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
    "components/ui/textarea.tsx": "// components/ui/textarea.tsx",
    "components/ui/toast.tsx": "// components/ui/toast.tsx",
    "components/ui/toaster.tsx": "// components/ui/toaster.tsx",
    "components/ui/tooltip.tsx": "// components/ui/tooltip.tsx",
    
    # Hooks
    "hooks/use-toast.ts": "// hooks/use-toast.ts",
    
    # Library files
    "lib/firebase.ts": "// lib/firebase.ts",
    "lib/utils.ts": "// lib/utils.ts",
    "lib/schemas/appointment.ts": "// lib/schemas/appointment.ts",
    "lib/schemas/pet.ts": "// lib/schemas/pet.ts",
    
    # Styles
    "styles/globals.css": "// styles/globals.css",
    
    # Types
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
