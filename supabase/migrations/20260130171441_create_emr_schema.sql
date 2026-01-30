/*
  # Create EMR + Patient Portal Schema

  ## Overview
  This migration creates the complete database schema for a mini-EMR system with patient portal functionality.

  ## New Tables
  
  ### `patients`
  - `id` (uuid, primary key) - Unique patient identifier
  - `name` (text) - Patient full name
  - `email` (text, unique) - Patient email for login
  - `password_hash` (text) - Hashed password for authentication
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `medication_options`
  - `id` (uuid, primary key) - Unique medication identifier
  - `name` (text, unique) - Medication name
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `dosage_options`
  - `id` (uuid, primary key) - Unique dosage identifier
  - `value` (text, unique) - Dosage value (e.g., "10mg", "20mg")
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `appointment_series`
  - `id` (uuid, primary key) - Unique series identifier
  - `patient_id` (uuid, foreign key) - References patients table
  - `provider_name` (text) - Healthcare provider name
  - `start_datetime` (timestamptz) - First appointment date and time
  - `repeat` (text) - Recurrence pattern: 'none', 'weekly', or 'monthly'
  - `ends_on` (date, nullable) - Optional end date for recurring appointments
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `prescriptions`
  - `id` (uuid, primary key) - Unique prescription identifier
  - `patient_id` (uuid, foreign key) - References patients table
  - `medication_name` (text) - Prescribed medication
  - `dosage_value` (text) - Prescribed dosage
  - `quantity` (integer) - Quantity prescribed
  - `refill_on` (date) - Next refill date
  - `refill_schedule` (text) - Refill frequency: 'none', 'weekly', or 'monthly'
  - `active` (boolean) - Whether prescription is currently active
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Admin operations have no RLS restrictions (handled at application level)
  - Patients can only view their own data through the portal
*/

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create medication_options table
CREATE TABLE IF NOT EXISTS medication_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create dosage_options table
CREATE TABLE IF NOT EXISTS dosage_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create appointment_series table
CREATE TABLE IF NOT EXISTS appointment_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  start_datetime timestamptz NOT NULL,
  repeat text NOT NULL DEFAULT 'none' CHECK (repeat IN ('none', 'weekly', 'monthly')),
  ends_on date,
  created_at timestamptz DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_name text NOT NULL,
  dosage_value text NOT NULL,
  quantity integer NOT NULL,
  refill_on date NOT NULL,
  refill_schedule text NOT NULL DEFAULT 'none' CHECK (refill_schedule IN ('none', 'weekly', 'monthly')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointment_series(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_datetime ON appointment_series(start_datetime);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_refill_on ON prescriptions(refill_on);
CREATE INDEX IF NOT EXISTS idx_prescriptions_active ON prescriptions(active);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE dosage_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients table
CREATE POLICY "Patients can view own record"
  ON patients FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for medication_options (read-only for all)
CREATE POLICY "Anyone can view medication options"
  ON medication_options FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for dosage_options (read-only for all)
CREATE POLICY "Anyone can view dosage options"
  ON dosage_options FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for appointment_series
CREATE POLICY "Patients can view own appointments"
  ON appointment_series FOR SELECT
  TO authenticated
  USING (auth.uid()::text = patient_id::text);

-- RLS Policies for prescriptions
CREATE POLICY "Patients can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (auth.uid()::text = patient_id::text);
