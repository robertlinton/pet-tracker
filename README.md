# Pet Tracker Overview

## Project Description
Pet Tracker is a Next.js web application designed to help users manage and track their pets' health and care routines.

## Key Features
- **Dashboard**: Real-time statistics and updates about pets, appointments, and medications
- **Pet Management**: Individual pet profiles with tracking for:
  - Appointments
  - Medications
  - Feeding schedules
  - Weight history
  - Notes

## Technical Stack
- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore)
- **UI Components**: Radix UI components
- **Form Handling**: React Hook Form with Zod validation

## Project Structure
```
├── app/ # Next.js app directory with routes and API
├── components/ # Reusable React components
├── hooks/ # Custom React hooks
├── styles/ # Global styles and Tailwind config
└── firebase.json # Firebase configuration
```

## Development
Run the development server:

```bash
npm run dev
```

Access the application at `http://localhost:3000`

The project uses modern development practices including TypeScript for type safety and Firebase for backend services.