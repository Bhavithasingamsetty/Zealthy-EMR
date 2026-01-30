import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AppointmentSeries, RepeatType } from '../lib/types';

interface AppointmentFormProps {
  patientId: string;
  appointment: AppointmentSeries | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function AppointmentForm({ patientId, appointment, onSave, onCancel }: AppointmentFormProps) {
  const [providerName, setProviderName] = useState(appointment?.provider_name || '');
  const [startDateTime, setStartDateTime] = useState(
    appointment ? new Date(appointment.start_datetime).toISOString().slice(0, 16) : ''
  );
  const [repeat, setRepeat] = useState<RepeatType>(appointment?.repeat || 'none');
  const [endsOn, setEndsOn] = useState(
    appointment?.ends_on ? new Date(appointment.ends_on).toISOString().slice(0, 10) : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        patient_id: patientId,
        provider_name: providerName,
        start_datetime: new Date(startDateTime).toISOString(),
        repeat,
        ends_on: repeat !== 'none' && endsOn ? endsOn : null,
      };

      if (appointment) {
        const { error: updateError } = await supabase
          .from('appointment_series')
          .update(data)
          .eq('id', appointment.id);

        if (updateError) {
          setError(updateError.message);
          setSaving(false);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from('appointment_series')
          .insert(data);

        if (insertError) {
          setError(insertError.message);
          setSaving(false);
          return;
        }
      }

      onSave();
    } catch (err) {
      setError('Failed to save appointment');
      setSaving(false);
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4">
        {appointment ? 'Edit Appointment' : 'New Appointment'}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
            Provider Name
          </label>
          <input
            type="text"
            id="provider"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Dr. Smith"
          />
        </div>

        <div>
          <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            id="datetime"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="repeat" className="block text-sm font-medium text-gray-700 mb-1">
            Repeat
          </label>
          <select
            id="repeat"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as RepeatType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="none">One-time</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {repeat !== 'none' && (
          <div>
            <label htmlFor="endsOn" className="block text-sm font-medium text-gray-700 mb-1">
              Ends On (Optional)
            </label>
            <input
              type="date"
              id="endsOn"
              value={endsOn}
              onChange={(e) => setEndsOn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for indefinite recurrence</p>
          </div>
        )}

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
