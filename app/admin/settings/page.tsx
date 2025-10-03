'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaCog,
  FaArrowLeft,
  FaSave,
  FaStore,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from 'react-icons/fa';
import Link from 'next/link';

interface Settings {
  id: number;
  shop_name: string;
  shop_description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  booking_advance_days: number;
  booking_slot_duration: number;
  max_bookings_per_slot: number;
}

export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        alert('Impostazioni salvate con successo!');
        fetchSettings();
      } else {
        const errorData = await res.json();
        alert('Errore: ' + (errorData.error || 'Impossibile salvare le impostazioni'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Errore di rete durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Settings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-[var(--secondary)] text-white"
                >
                  <FaArrowLeft />
                </motion.button>
              </Link>
              <div>
                <h1
                  className="text-2xl font-bold text-[var(--primary)]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Impostazioni
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Configura il tuo negozio
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--secondary)] text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <FaSave />
              <span>{saving ? 'Salvataggio...' : 'Salva Modifiche'}</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--secondary)]"></div>
          </div>
        ) : !settings ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Impossibile caricare le impostazioni
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Shop Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <FaStore className="text-[var(--secondary)] text-xl" />
                <h2 className="text-xl font-bold text-[var(--primary)]">
                  Informazioni Negozio
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                    Nome Negozio
                  </label>
                  <input
                    type="text"
                    value={settings.shop_name}
                    onChange={(e) => updateField('shop_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                    Descrizione
                  </label>
                  <textarea
                    value={settings.shop_description}
                    onChange={(e) =>
                      updateField('shop_description', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                    rows={4}
                  />
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <FaPhone className="text-[var(--secondary)] text-xl" />
                <h2 className="text-xl font-bold text-[var(--primary)]">
                  Contatti
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                    <FaPhone className="inline mr-2" />
                    Telefono
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                    <FaEnvelope className="inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <FaMapMarkerAlt className="text-[var(--secondary)] text-xl" />
                <h2 className="text-xl font-bold text-[var(--primary)]">
                  Indirizzo
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                    Via
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                      Città
                    </label>
                    <input
                      type="text"
                      value={settings.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                      CAP
                    </label>
                    <input
                      type="text"
                      value={settings.postal_code}
                      onChange={(e) => updateField('postal_code', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Booking Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <FaClock className="text-[var(--secondary)] text-xl" />
                <h2 className="text-xl font-bold text-[var(--primary)]">
                  Impostazioni Prenotazioni
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                    Giorni di anticipo
                  </label>
                  <input
                    type="number"
                    value={settings.booking_advance_days}
                    onChange={(e) =>
                      updateField('booking_advance_days', parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Quanti giorni in anticipo si può prenotare
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                    Durata slot (minuti)
                  </label>
                  <input
                    type="number"
                    value={settings.booking_slot_duration}
                    onChange={(e) =>
                      updateField('booking_slot_duration', parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Durata di ogni slot di prenotazione
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                    Max prenotazioni per slot
                  </label>
                  <input
                    type="number"
                    value={settings.max_bookings_per_slot}
                    onChange={(e) =>
                      updateField('max_bookings_per_slot', parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Numero massimo di prenotazioni contemporanee
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}