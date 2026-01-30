/*
  # Add INSERT policies for admin operations

  ## Changes
  - Add INSERT policies for all tables to allow admin operations
  - These policies allow inserts from both authenticated and anonymous users
  - This supports the admin interface which has no authentication
*/

-- Allow anyone to insert patients (admin interface has no auth)
CREATE POLICY "Allow insert patients"
  ON patients FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to insert medication options
CREATE POLICY "Allow insert medication options"
  ON medication_options FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to insert dosage options
CREATE POLICY "Allow insert dosage options"
  ON dosage_options FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to insert appointment series
CREATE POLICY "Allow insert appointments"
  ON appointment_series FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update appointments
CREATE POLICY "Allow update appointments"
  ON appointment_series FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete appointments
CREATE POLICY "Allow delete appointments"
  ON appointment_series FOR DELETE
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert prescriptions
CREATE POLICY "Allow insert prescriptions"
  ON prescriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update prescriptions
CREATE POLICY "Allow update prescriptions"
  ON prescriptions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete prescriptions
CREATE POLICY "Allow delete prescriptions"
  ON prescriptions FOR DELETE
  TO anon, authenticated
  USING (true);

-- Allow anyone to update patients
CREATE POLICY "Allow update patients"
  ON patients FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anyone to select all patients (for admin interface)
CREATE POLICY "Allow select all patients"
  ON patients FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to select all appointments (for admin interface)
CREATE POLICY "Allow select all appointments"
  ON appointment_series FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to select all prescriptions (for admin interface)
CREATE POLICY "Allow select all prescriptions"
  ON prescriptions FOR SELECT
  TO anon, authenticated
  USING (true);
