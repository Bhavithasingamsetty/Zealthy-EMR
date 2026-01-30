# Mini-EMR + Patient Portal

A full-stack Electronic Medical Records system with patient portal built with React, TypeScript, Vite, and Supabase.

## Features

### Admin Portal (No Authentication)
- View all patients with at-a-glance stats
- Create and manage patient records
- Schedule appointments with recurring options (weekly, monthly)
- Manage prescriptions with automatic refill scheduling
- End recurring appointments

### Patient Portal (Authenticated)
- Secure login with email and password
- Dashboard showing:
  - Appointments in the next 7 days
  - Prescription refills due in the next 7 days
- Full appointment schedule (3 months ahead)
- Full prescription list with upcoming refills (3 months ahead)

### Data Management
- Recurring appointments (none, weekly, monthly)
- Recurring prescription refills (none, weekly, monthly)
- Automatic occurrence generation for schedules
- Secure password hashing

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth)
- **Security**: Row Level Security (RLS) policies

## Setup

1. Install dependencies:
```bash
npm install
```

2. Seed the database:
```bash
npm run seed
```

3. Start the development server:
```bash
npm run dev
```

## Demo Credentials

### Patient Portal Login
- Email: `mark@example.com`
- Password: `Password123!`

Additional demo accounts:
- Email: `emily@example.com` | Password: `Password123!`
- Email: `robert@example.com` | Password: `Password123!`

## Routes

### Patient Portal
- `/` - Login page
- `/portal` - Dashboard (7-day summary)
- `/portal/appointments` - Full appointments list (3 months)
- `/portal/prescriptions` - Full prescriptions list (3 months)

### Admin Portal
- `/admin` - Patient list
- `/admin/patients/new` - Create new patient
- `/admin/patients/:id` - Patient details with appointment and prescription management

## Database Schema

### Tables
- `patients` - Patient records with hashed passwords
- `medication_options` - Available medications (seeded)
- `dosage_options` - Available dosages (seeded)
- `appointment_series` - Appointment series with recurrence rules
- `prescriptions` - Prescriptions with refill schedules

## Recurrence Logic

The system generates occurrences on-the-fly from appointment series and prescription refill schedules. This approach:
- Keeps the database clean and small
- Makes ending recurring schedules simple
- Allows flexible window queries (7 days, 3 months, etc.)

## Build

```bash
npm run build
```

## License

MIT
# Zealthy-EMR
