import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../lib/auth';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from './AdminLayout';

export default function AdminPatientNew() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const passwordHash = await hashPassword(password);

      const { data, error: insertError } = await supabase
        .from('patients')
        .insert({
          name,
          email,
          password_hash: passwordHash,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }

      window.location.href = `/admin/patients/${data.id}`;
    } catch (err) {
      setError('Failed to create patient');
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">New Patient</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {saving ? 'Creating...' : 'Create Patient'}
              </button>
              <a
                href="/admin"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
