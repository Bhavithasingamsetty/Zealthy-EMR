import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Patient, AppointmentSeries, Prescription, MedicationOption, DosageOption } from '../lib/types';
import { ArrowLeft, Calendar, Pill, Plus, Trash2, Edit2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AppointmentForm from '../components/AppointmentForm';
import PrescriptionForm from '../components/PrescriptionForm';
import { formatDateTime, formatDate } from '../lib/recurrence';

interface AdminPatientDetailProps {
  patientId: string;
}

export default function AdminPatientDetail({ patientId }: AdminPatientDetailProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<AppointmentSeries[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medications, setMedications] = useState<MedicationOption[]>([]);
  const [dosages, setDosages] = useState<DosageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions'>('appointments');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentSeries | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    loadData();
  }, [patientId]);

  async function loadData() {
    setLoading(true);

    const [patientRes, appointmentsRes, prescriptionsRes, medicationsRes, dosagesRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).maybeSingle(),
      supabase.from('appointment_series').select('*').eq('patient_id', patientId).order('start_datetime', { ascending: false }),
      supabase.from('prescriptions').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('medication_options').select('*').order('name'),
      supabase.from('dosage_options').select('*').order('value'),
    ]);

    if (patientRes.data) setPatient(patientRes.data);
    if (appointmentsRes.data) setAppointments(appointmentsRes.data);
    if (prescriptionsRes.data) setPrescriptions(prescriptionsRes.data);
    if (medicationsRes.data) setMedications(medicationsRes.data);
    if (dosagesRes.data) setDosages(dosagesRes.data);

    setLoading(false);
  }

  async function deleteAppointment(id: string) {
    if (!confirm('Are you sure you want to delete this appointment series?')) return;

    await supabase.from('appointment_series').delete().eq('id', id);
    loadData();
  }

  async function deletePrescription(id: string) {
    if (!confirm('Are you sure you want to delete this prescription?')) return;

    await supabase.from('prescriptions').delete().eq('id', id);
    loadData();
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading patient...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!patient) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient not found</h2>
          <a href="/admin" className="text-blue-600 hover:text-blue-800">
            Back to Patients
          </a>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <a
            href="/admin"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patients</span>
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{patient.name}</h1>
          <p className="text-gray-600">{patient.email}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'appointments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Appointments</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {appointments.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'prescriptions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Pill className="w-4 h-4" />
                  <span>Prescriptions</span>
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {prescriptions.filter((p) => p.active).length}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Appointment Series</h2>
                  <button
                    onClick={() => {
                      setEditingAppointment(null);
                      setShowAppointmentForm(true);
                    }}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Appointment</span>
                  </button>
                </div>

                {showAppointmentForm && (
                  <AppointmentForm
                    patientId={patientId}
                    appointment={editingAppointment}
                    onSave={() => {
                      setShowAppointmentForm(false);
                      setEditingAppointment(null);
                      loadData();
                    }}
                    onCancel={() => {
                      setShowAppointmentForm(false);
                      setEditingAppointment(null);
                    }}
                  />
                )}

                {appointments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{appointment.provider_name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {formatDateTime(new Date(appointment.start_datetime))}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {appointment.repeat === 'none' ? (
                                <span>One-time appointment</span>
                              ) : (
                                <span>
                                  Repeats {appointment.repeat}
                                  {appointment.ends_on && ` until ${formatDate(new Date(appointment.ends_on))}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingAppointment(appointment);
                                setShowAppointmentForm(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAppointment(appointment.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Prescriptions</h2>
                  <button
                    onClick={() => {
                      setEditingPrescription(null);
                      setShowPrescriptionForm(true);
                    }}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Prescription</span>
                  </button>
                </div>

                {showPrescriptionForm && (
                  <PrescriptionForm
                    patientId={patientId}
                    medications={medications}
                    dosages={dosages}
                    prescription={editingPrescription}
                    onSave={() => {
                      setShowPrescriptionForm(false);
                      setEditingPrescription(null);
                      loadData();
                    }}
                    onCancel={() => {
                      setShowPrescriptionForm(false);
                      setEditingPrescription(null);
                    }}
                  />
                )}

                {prescriptions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No prescriptions on file</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          prescription.active
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {prescription.medication_name}
                              </span>
                              <span className="text-sm text-gray-500">{prescription.dosage_value}</span>
                              {!prescription.active && (
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Quantity: {prescription.quantity}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Next refill: {formatDate(new Date(prescription.refill_on))}
                              {prescription.refill_schedule !== 'none' &&
                                ` (${prescription.refill_schedule})`}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingPrescription(prescription);
                                setShowPrescriptionForm(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletePrescription(prescription.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
