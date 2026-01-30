import { supabase } from './supabase';

export async function loginPatient(email: string, password: string) {
  const { data: patient, error: fetchError } = await supabase
    .from('patients')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (fetchError || !patient) {
    return { error: 'Invalid email or password' };
  }

  const passwordMatch = await verifyPassword(password, patient.password_hash);

  if (!passwordMatch) {
    return { error: 'Invalid email or password' };
  }

  sessionStorage.setItem('patient_id', patient.id);
  sessionStorage.setItem('patient_name', patient.name);
  sessionStorage.setItem('patient_email', patient.email);

  return { patient };
}

export function logoutPatient() {
  sessionStorage.removeItem('patient_id');
  sessionStorage.removeItem('patient_name');
  sessionStorage.removeItem('patient_email');
}

export function getCurrentPatient() {
  const id = sessionStorage.getItem('patient_id');
  const name = sessionStorage.getItem('patient_name');
  const email = sessionStorage.getItem('patient_email');

  if (!id || !name || !email) {
    return null;
  }

  return { id, name, email };
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return computedHash === hash;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
