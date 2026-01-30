import { createClient } from '@supabase/supabase-js';
import seedData from './seed-data.json';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function seed() {
  console.log('Starting database seed...');

  console.log('Seeding medications...');
  for (const medication of seedData.medications) {
    const { error } = await supabase
      .from('medication_options')
      .upsert({ name: medication }, { onConflict: 'name' });

    if (error) {
      console.error(`Error inserting medication ${medication}:`, error);
    }
  }

  console.log('Seeding dosages...');
  for (const dosage of seedData.dosages) {
    const { error } = await supabase
      .from('dosage_options')
      .upsert({ value: dosage }, { onConflict: 'value' });

    if (error) {
      console.error(`Error inserting dosage ${dosage}:`, error);
    }
  }

  console.log('Seeding patients...');
  for (const user of seedData.users) {
    const passwordHash = await hashPassword(user.password);

    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    let patientId = user.id;

    if (existingPatient) {
      console.log(`Patient ${user.email} already exists, updating...`);
      const { error } = await supabase
        .from('patients')
        .update({
          name: user.name,
          password_hash: passwordHash,
        })
        .eq('email', user.email);

      if (error) {
        console.error(`Error updating patient ${user.email}:`, error);
        continue;
      }
      patientId = existingPatient.id;
    } else {
      const { data: newPatient, error } = await supabase
        .from('patients')
        .insert({
          id: user.id,
          name: user.name,
          email: user.email,
          password_hash: passwordHash,
        })
        .select()
        .single();

      if (error) {
        console.error(`Error inserting patient ${user.email}:`, error);
        continue;
      }
      patientId = newPatient.id;
    }

    console.log(`Seeding appointments for ${user.name}...`);
    for (const appointment of user.appointments) {
      const { error } = await supabase
        .from('appointment_series')
        .insert({
          patient_id: patientId,
          provider_name: appointment.provider,
          start_datetime: appointment.datetime,
          repeat: appointment.repeat,
        });

      if (error) {
        console.error(`Error inserting appointment for ${user.name}:`, error);
      }
    }

    console.log(`Seeding prescriptions for ${user.name}...`);
    for (const prescription of user.prescriptions) {
      const { error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: patientId,
          medication_name: prescription.medication,
          dosage_value: prescription.dosage,
          quantity: prescription.quantity,
          refill_on: prescription.refill_on,
          refill_schedule: prescription.refill_schedule,
          active: true,
        });

      if (error) {
        console.error(`Error inserting prescription for ${user.name}:`, error);
      }
    }
  }

  console.log('Seed completed successfully!');
  console.log('\nDemo login credentials:');
  console.log('Email: mark@example.com');
  console.log('Password: Password123!');
}

seed().catch(console.error);
