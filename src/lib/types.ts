export type RepeatType = 'none' | 'weekly' | 'monthly';

export interface Patient {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface MedicationOption {
  id: string;
  name: string;
  created_at: string;
}

export interface DosageOption {
  id: string;
  value: string;
  created_at: string;
}

export interface AppointmentSeries {
  id: string;
  patient_id: string;
  provider_name: string;
  start_datetime: string;
  repeat: RepeatType;
  ends_on: string | null;
  created_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage_value: string;
  quantity: number;
  refill_on: string;
  refill_schedule: RepeatType;
  active: boolean;
  created_at: string;
}

export interface AppointmentOccurrence {
  seriesId: string;
  date: Date;
  providerName: string;
}

export interface RefillOccurrence {
  prescriptionId: string;
  date: Date;
  medicationName: string;
  dosageValue: string;
  quantity: number;
}

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: Patient;
        Insert: Omit<Patient, 'id' | 'created_at'>;
        Update: Partial<Omit<Patient, 'id' | 'created_at'>>;
      };
      medication_options: {
        Row: MedicationOption;
        Insert: Omit<MedicationOption, 'id' | 'created_at'>;
        Update: Partial<Omit<MedicationOption, 'id' | 'created_at'>>;
      };
      dosage_options: {
        Row: DosageOption;
        Insert: Omit<DosageOption, 'id' | 'created_at'>;
        Update: Partial<Omit<DosageOption, 'id' | 'created_at'>>;
      };
      appointment_series: {
        Row: AppointmentSeries;
        Insert: Omit<AppointmentSeries, 'id' | 'created_at'>;
        Update: Partial<Omit<AppointmentSeries, 'id' | 'created_at'>>;
      };
      prescriptions: {
        Row: Prescription;
        Insert: Omit<Prescription, 'id' | 'created_at'>;
        Update: Partial<Omit<Prescription, 'id' | 'created_at'>>;
      };
    };
  };
}
