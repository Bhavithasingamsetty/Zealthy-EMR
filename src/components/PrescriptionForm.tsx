import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import type { Prescription, MedicationOption, DosageOption, RepeatType } from '../lib/types';

interface PrescriptionFormProps {
  patientId: string;
  medications: MedicationOption[];
  dosages: DosageOption[];
  prescription: Prescription | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function PrescriptionForm({
  patientId,
  medications,
  dosages,
  prescription,
  onSave,
  onCancel,
}: PrescriptionFormProps) {
  const [medicationName, setMedicationName] = useState(prescription?.medication_name || '');
  const [dosageValue, setDosageValue] = useState(prescription?.dosage_value || '');
  const [quantity, setQuantity] = useState(prescription?.quantity.toString() || '');
  const [refillOn, setRefillOn] = useState(
    prescription ? new Date(prescription.refill_on).toISOString().slice(0, 10) : ''
  );
  const [refillSchedule, setRefillSchedule] = useState<RepeatType>(
    prescription?.refill_schedule || 'monthly'
  );
  const [active, setActive] = useState(prescription?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        patient_id: patientId,
        medication_name: medicationName,
        dosage_value: dosageValue,
        quantity: parseInt(quantity),
        refill_on: refillOn,
        refill_schedule: refillSchedule,
        active,
      };

      if (prescription) {
        const { error: updateError } = await supabase
          .from('prescriptions')
          .update(data)
          .eq('id', prescription.id);

        if (updateError) {
          setError(updateError.message);
          setSaving(false);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from('prescriptions')
          .insert(data);

        if (insertError) {
          setError(insertError.message);
          setSaving(false);
          return;
        }
      }

      onSave();
    } catch (err) {
      setError('Failed to save prescription');
      setSaving(false);
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4">
        {prescription ? 'Edit Prescription' : 'New Prescription'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
            Medication
          </label>
          <select
            id="medication"
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a medication</option>
            {medications.map((med) => (
              <option key={med.id} value={med.name}>
                {med.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
            Dosage
          </label>
          <select
            id="dosage"
            value={dosageValue}
            onChange={(e) => setDosageValue(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a dosage</option>
            {dosages.map((dos) => (
              <option key={dos.id} value={dos.value}>
                {dos.value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="30"
          />
        </div>

        <div>
          <label htmlFor="refillOn" className="block text-sm font-medium text-gray-700 mb-1">
            Next Refill Date
          </label>
          <input
            type="date"
            id="refillOn"
            value={refillOn}
            onChange={(e) => setRefillOn(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="refillSchedule" className="block text-sm font-medium text-gray-700 mb-1">
            Refill Schedule
          </label>
          <select
            id="refillSchedule"
            value={refillSchedule}
            onChange={(e) => setRefillSchedule(e.target.value as RepeatType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="none">One-time</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="active" className="ml-2 text-sm text-gray-700">
            Active prescription
          </label>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
