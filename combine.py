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
    "app/pets/[id]/medications/medications-client.tsx": "// app/pets/[id]/medications/medications-client.tsx",
    "app/pets/[id]/medications/page.tsx": "// app/pets/[id]/medications/page.tsx",
    "app/pets/[id]/notes/page.tsx": "// app/pets/[id]/notes/page.tsx",
    "app/pets/[id]/weight/page.tsx": "// app/pets/[id]/weight/page.tsx",
    
    # Settings page
    "app/settings/page.tsx": "// app/settings/page.tsx",
    
    # Components
    "components/AddAppointmentDialog.tsx": "// components/AddAppointmentDialog.tsx",
    "components/AddMedicationDialog.tsx": "// components/AddMedicationDialog.tsx",
    "components/AddPetDialog.tsx": "// components/AddPetDialog.tsx",
    "components/AppointmentCard.tsx": "// components/AppointmentCard.tsx",
    "components/EditAppointmentDialog.tsx": "// components/EditAppointmentDialog.tsx",
    "components/EditMedicationDialog.tsx": "// components/EditMedicationDialog.tsx",
    "components/EditPetDialog.tsx": "// components/EditPetDialog.tsx",
    "components/MedicationCard.tsx": "// components/MedicationCard.tsx",
    "components/Sidebar.tsx": "// components/Sidebar.tsx",
    
    # Hooks
    "hooks/use-toast.ts": "// hooks/use-toast.ts",
    
    # Library files
    "lib/firebase.ts": "// lib/firebase.ts",
    "lib/utils.ts": "// lib/utils.ts",
    "lib/schemas/appointment.ts": "// lib/schemas/appointment.ts",
    "lib/schemas/medication.ts": "// lib/schemas/medication.ts",
    "lib/schemas/pet.ts": "// lib/schemas/pet.ts",
    
    # Styles
    "styles/globals.css": "// styles/globals.css",
    
    # Types
    "types/index.ts": "// types/index.ts"
}

# Output file names
output_file_1 = "combined_files_part1.txt"
output_file_2 = "combined_files_part2.txt"

# Open the output files in write mode
with open(output_file_1, "w", encoding="utf-8") as output1, open(output_file_2, "w", encoding="utf-8") as output2:
    outputs = [output1, output2]
    # Track which output file to use
    file_selector = 0
    
    # Iterate over each file path
    for file_path, placeholder in file_paths.items():
        # Get the current output file and toggle for the next iteration
        output = outputs[file_selector]
        file_selector = 1 - file_selector  # Toggle between 0 and 1

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

print(f"Combined files created: {output_file_1} and {output_file_2}")
