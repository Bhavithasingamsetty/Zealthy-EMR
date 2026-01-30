import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentPatient } from '../lib/auth';
import { generateRefillOccurrences, formatDate } from '../lib/recurrence';
import type { Prescription, RefillOccurrence } from '../lib/types';
import { Pill } from 'lucide-react';
import PortalLayout from './PortalLayout';

interface PrescriptionWithRefills extends Prescription {
  upcomingRefills: RefillOccurrence[];
}

export default function PortalPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithRefills[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  async function loadPrescriptions() {
    const patient = getCurrentPatient();
    if (!patient) return;

    setLoading(true);

    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const { data: prescriptionsData } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('active', true)
      .order('refill_on');

    if (prescriptionsData) {
      const prescriptionsWithRefills = prescriptionsData.map((prescription) => {
        const upcomingRefills = generateRefillOccurrences(prescription, now, threeMonthsFromNow);
        return {
          ...prescription,
          upcomingRefills,
        };
      });
      setPrescriptions(prescriptionsWithRefills);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <PortalLayout currentPage="prescriptions">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading prescriptions...</div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout currentPage="prescriptions">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescriptions</h1>
          <p className="text-gray-600">Your active prescriptions and refill schedule</p>
        </div>

        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active prescriptions</h3>
            <p className="text-gray-500">You don't have any active prescriptions on file</p>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6 bg-gradient-to-r from-orange-50 to-white border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Pill className="w-6 h-6 text-orange-600" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {prescription.medication_name}
                        </h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <div className="text-sm text-gray-600">Dosage</div>
                          <div className="font-medium text-gray-900">{prescription.dosage_value}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Quantity</div>
                          <div className="font-medium text-gray-900">{prescription.quantity}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Refill Schedule</div>
                          <div className="font-medium text-gray-900 capitalize">
                            {prescription.refill_schedule}
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                    Upcoming Refills (Next 3 Months)
                  </h4>
                  {prescription.upcomingRefills.length === 0 ? (
                    <p className="text-sm text-gray-500">No refills scheduled in the next 3 months</p>
                  ) : (
                    <div className="space-y-2">
                      {prescription.upcomingRefills.map((refill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(refill.date)}
                          </div>
                          <div className="text-sm text-gray-600">Quantity: {refill.quantity}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
