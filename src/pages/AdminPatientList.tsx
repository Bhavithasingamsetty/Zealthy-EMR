import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getNextAppointmentDate, formatDate } from '../lib/recurrence';
import type { Patient, AppointmentSeries, Prescription } from '../lib/types';
import { UserPlus, Calendar, Pill } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface PatientWithStats extends Patient {
  nextAppointment: Date | null;
  activePrescriptions: number;
}

export default function AdminPatientList() {
  const [patients, setPatients] = useState<PatientWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setLoading(true);
    const { data: patientsData } = await supabase
      .from('patients')
      .select('*')
      .order('name');

    if (patientsData) {
      const patientsWithStats = await Promise.all(
        patientsData.map(async (patient) => {
          const { data: appointments } = await supabase
            .from('appointment_series')
            .select('*')
            .eq('patient_id', patient.id);

          const { data: prescriptions } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('patient_id', patient.id)
            .eq('active', true);

          let nextAppointment: Date | null = null;
          if (appointments && appointments.length > 0) {
            const dates = appointments
              .map((apt) => getNextAppointmentDate(apt))
              .filter((d): d is Date => d !== null)
              .sort((a, b) => a.getTime() - b.getTime());
            nextAppointment = dates[0] || null;
          }

          return {
            ...patient,
            nextAppointment,
            activePrescriptions: prescriptions?.length || 0,
          };
        })
      );

      setPatients(patientsWithStats);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading patients...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <a
            href="/admin/patients/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Patient</span>
          </a>
        </div>

        {patients.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first patient</p>
            <a
              href="/admin/patients/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Patient</span>
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Prescriptions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{patient.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {patient.nextAppointment ? (
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(patient.nextAppointment)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Pill className="w-4 h-4 text-gray-400" />
                        <span>{patient.activePrescriptions}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <a
                        href={`/admin/patients/${patient.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
