import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentPatient } from '../lib/auth';
import { generateAppointmentOccurrences, generateRefillOccurrences, formatDateTime, formatDate } from '../lib/recurrence';
import type { AppointmentSeries, Prescription, AppointmentOccurrence, RefillOccurrence } from '../lib/types';
import { Calendar, Pill, User, ArrowRight } from 'lucide-react';
import PortalLayout from './PortalLayout';

export default function PortalDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentOccurrence[]>([]);
  const [upcomingRefills, setUpcomingRefills] = useState<RefillOccurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const patient = getCurrentPatient();
    if (!patient) return;

    setLoading(true);

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [appointmentsRes, prescriptionsRes] = await Promise.all([
      supabase.from('appointment_series').select('*').eq('patient_id', patient.id),
      supabase.from('prescriptions').select('*').eq('patient_id', patient.id).eq('active', true),
    ]);

    const appointments: AppointmentOccurrence[] = [];
    if (appointmentsRes.data) {
      for (const series of appointmentsRes.data) {
        const occurrences = generateAppointmentOccurrences(series, now, sevenDaysFromNow);
        appointments.push(...occurrences);
      }
    }
    appointments.sort((a, b) => a.date.getTime() - b.date.getTime());
    setUpcomingAppointments(appointments);

    const refills: RefillOccurrence[] = [];
    if (prescriptionsRes.data) {
      for (const prescription of prescriptionsRes.data) {
        const occurrences = generateRefillOccurrences(prescription, now, sevenDaysFromNow);
        refills.push(...occurrences);
      }
    }
    refills.sort((a, b) => a.date.getTime() - b.date.getTime());
    setUpcomingRefills(refills);

    setLoading(false);
  }

  const patient = getCurrentPatient();

  if (loading) {
    return (
      <PortalLayout currentPage="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout currentPage="dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {patient?.name?.split(' ')[0]}</h1>
          <p className="text-gray-600">Here's your health summary for the next 7 days</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Patient Info</h2>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Name</div>
              <div className="font-medium text-gray-900">{patient?.name}</div>
              <div className="text-sm text-gray-600 mt-3">Email</div>
              <div className="font-medium text-gray-900">{patient?.email}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
              </div>
              <span className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">in the next 7 days</p>
            <a
              href="/portal/appointments"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Pill className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Refills</h2>
              </div>
              <span className="text-2xl font-bold text-gray-900">{upcomingRefills.length}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">in the next 7 days</p>
            <a
              href="/portal/prescriptions"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No appointments in the next 7 days</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt, index) => (
                  <div
                    key={`${apt.seriesId}-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{apt.providerName}</div>
                    <div className="text-sm text-gray-600 mt-1">{formatDateTime(apt.date)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Refills</h2>
            {upcomingRefills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No refills due in the next 7 days</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingRefills.map((refill, index) => (
                  <div
                    key={`${refill.prescriptionId}-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {refill.medicationName} {refill.dosageValue}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Refill on {formatDate(refill.date)} • Qty: {refill.quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
