import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentPatient } from '../lib/auth';
import { generateAppointmentOccurrences, formatDateTime } from '../lib/recurrence';
import type { AppointmentOccurrence } from '../lib/types';
import { Calendar } from 'lucide-react';
import PortalLayout from './PortalLayout';

export default function PortalAppointments() {
  const [appointments, setAppointments] = useState<AppointmentOccurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    const patient = getCurrentPatient();
    if (!patient) return;

    setLoading(true);

    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const { data: appointmentSeries } = await supabase
      .from('appointment_series')
      .select('*')
      .eq('patient_id', patient.id);

    const allAppointments: AppointmentOccurrence[] = [];
    if (appointmentSeries) {
      for (const series of appointmentSeries) {
        const occurrences = generateAppointmentOccurrences(series, now, threeMonthsFromNow);
        allAppointments.push(...occurrences);
      }
    }

    allAppointments.sort((a, b) => a.date.getTime() - b.date.getTime());
    setAppointments(allAppointments);
    setLoading(false);
  }

  if (loading) {
    return (
      <PortalLayout currentPage="appointments">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading appointments...</div>
        </div>
      </PortalLayout>
    );
  }

  const groupedAppointments = appointments.reduce((groups, apt) => {
    const monthYear = apt.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(apt);
    return groups;
  }, {} as Record<string, AppointmentOccurrence[]>);

  return (
    <PortalLayout currentPage="appointments">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
          <p className="text-gray-600">Your scheduled appointments for the next 3 months</p>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
            <p className="text-gray-500">You don't have any appointments scheduled</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedAppointments).map(([monthYear, monthAppointments]) => (
              <div key={monthYear}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{monthYear}</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
                  {monthAppointments.map((apt, index) => (
                    <div key={`${apt.seriesId}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">{apt.providerName}</span>
                          </div>
                          <div className="text-gray-700">{formatDateTime(apt.date)}</div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            Scheduled
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
