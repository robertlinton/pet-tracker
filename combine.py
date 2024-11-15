import os

# Updated list of file paths
file_paths = [
    "components.json",
    "middleware.ts",
    "app/layout.tsx",
    "app/not-found.tsx",
    "app/page.tsx",
    "app/providers.tsx",
    "app/(auth)/layout.tsx",
    "app/(auth)/reset-password/page.tsx",
    "app/(auth)/signin/page.tsx",
    "app/(auth)/signup/page.tsx",
    "app/(protected)/layout.tsx",
    "app/(protected)/dashboard/page.tsx",
    "app/(protected)/pets/[id]/error.tsx",
    "app/(protected)/pets/[id]/layout.tsx",
    "app/(protected)/pets/[id]/loading.tsx",
    "app/(protected)/pets/[id]/not-found.tsx",
    "app/(protected)/pets/[id]/page.tsx",
    "app/(protected)/pets/[id]/pet-overview-client.tsx",
    "app/(protected)/pets/[id]/appointments/appointments-client.tsx",
    "app/(protected)/pets/[id]/appointments/page.tsx",
    "app/(protected)/pets/[id]/feeding/page.tsx",
    "app/(protected)/pets/[id]/medications/page.tsx",
    "app/(protected)/pets/[id]/notes/page.tsx",
    "app/(protected)/pets/[id]/weight/page.tsx",
    "app/(protected)/settings/page.tsx",
    "app/api/pets/upload/route.ts",
    "app/mobile-not-supported/page.tsx",
    "components/AddAppointmentDialog.tsx",
    "components/AddPetDialog.tsx",
    "components/AppointmentCard.tsx",
    "components/EditAppointmentDialog.tsx",
    "components/EditPetDialog.tsx",
    "components/icons.tsx",
    "components/Sidebar.tsx",
    "components/auth/PrivateRoute.tsx",
    "components/ui/alert-dialog.tsx",
    "components/ui/avatar.tsx",
    "components/ui/badge.tsx",
    "components/ui/button.tsx",
    "components/ui/card.tsx",
    "components/ui/dialog.tsx",
    "components/ui/dropdown-menu.tsx",
    "components/ui/form.tsx",
    "components/ui/input.tsx",
    "components/ui/label.tsx",
    "components/ui/loading.tsx",
    "components/ui/progress.tsx",
    "components/ui/scroll-area.tsx",
    "components/ui/select.tsx",
    "components/ui/separator.tsx",
    "components/ui/skeleton.tsx",
    "components/ui/tabs.tsx",
    "components/ui/textarea.tsx",
    "components/ui/toast.tsx",
    "components/ui/toaster.tsx",
    "components/ui/tooltip.tsx",
    "hooks/use-toast.ts",
    "lib/firebase-admin.ts",
    "lib/firebase.ts",
    "lib/utils.ts",
    "lib/context/auth-context.tsx",
    "lib/schemas/appointment.ts",
    "lib/schemas/pet.ts",
    "styles/globals.css",
    "types/index.ts"
]

# Divide the file paths into two halves
mid_index = len(file_paths) // 2
file_paths_part1 = file_paths[:mid_index]
file_paths_part2 = file_paths[mid_index:]

# Output file names
output_file1 = "combined_files_part1.txt"
output_file2 = "combined_files_part2.txt"

# Function to ensure directory exists for the output file
def ensure_directory(file_path):
    directory = os.path.dirname(file_path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

# Function to combine files into an output file
def combine_files(file_list, output_file):
    with open(output_file, "w", encoding="utf-8") as output:
        for file_path in file_list:
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
                # Write a message indicating the file was not found
                output.write(f"// File not found: {file_path}\n\n")
                print(f"File not found: {file_path}")

# Combine files into the first output file
combine_files(file_paths_part1, output_file1)

# Combine files into the second output file
combine_files(file_paths_part2, output_file2)

print(f"Combined files created: {output_file1} and {output_file2}")
