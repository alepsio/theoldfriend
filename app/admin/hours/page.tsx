'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaClock,
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa';
import Link from 'next/link';

interface WorkingHour {
  id: number;
  barber_id: number | null;
  barber_name: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Barber {
  id: number;
  name: string;
}

const DAYS = [
  'Domenica',
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
];

export default function AdminHours() {
  const router = useRouter();
  const [hours, setHours] = useState<WorkingHour[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    barber_id: '',
    day_of_week: '1',
    start_time: '09:00',
    end_time: '19:00',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');

      // Fetch working hours
      const hoursRes = await fetch('/api/admin/working-hours', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (hoursRes.ok) {
        const hoursData = await hoursRes.json();
        setHours(hoursData);
      }

      // Fetch barbers
      const barbersRes = await fetch('/api/admin/barbers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (barbersRes.ok) {
        const barbersData = await barbersRes.json();
        setBarbers(barbersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/working-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          barber_id: formData.barber_id ? parseInt(formData.barber_id) : null,
          day_of_week: parseInt(formData.day_of_week),
          start_time: formData.start_time,
          end_time: formData.end_time,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormData({
          barber_id: '',
          day_of_week: '1',
          start_time: '09:00',
          end_time: '19:00',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding working hour:', error);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      const hour = hours.find((h) => h.id === id);
      if (!hour) return;

      const res = await fetch(`/api/admin/working-hours/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          barber_id: hour.barber_id,
          day_of_week: hour.day_of_week,
          start_time: hour.start_time,
          end_time: hour.end_time,
          is_active: hour.is_active,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating working hour:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo orario?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/working-hours/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting working hour:', error);
    }
  };

  const toggleActive = async (id: number) => {
    const hour = hours.find((h) => h.id === id);
    if (!hour) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/working-hours/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...hour,
          is_active: !hour.is_active,
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const updateHourField = (id: number, field: keyof WorkingHour, value: any) => {
    setHours(hours.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
  };

  // Group hours by barber
  const groupedHours = hours.reduce((acc, hour) => {
    const key = hour.barber_id || 'general';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(hour);
    return acc;
  }, {} as Record<string | number, WorkingHour[]>);

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
                  Gestione Orari
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Imposta orari di lavoro
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="bg-[var(--secondary)] text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FaPlus />
              <span>Aggiungi Orario</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">
              Nuovo Orario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  Barbiere (lascia vuoto per orario generale)
                </label>
                <select
                  value={formData.barber_id}
                  onChange={(e) =>
                    setFormData({ ...formData, barber_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                >
                  <option value="">Orario Generale</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  Giorno *
                </label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) =>
                    setFormData({ ...formData, day_of_week: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  Ora Inizio *
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  Ora Fine *
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FaSave />
                <span>Salva</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    barber_id: '',
                    day_of_week: '1',
                    start_time: '09:00',
                    end_time: '19:00',
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FaTimes />
                <span>Annulla</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Hours List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--secondary)]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHours).map(([key, groupHours]) => (
              <div key={key} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-4">
                  {key === 'general'
                    ? 'Orari Generali'
                    : groupHours[0]?.barber_name || 'Barbiere'}
                </h3>
                <div className="space-y-3">
                  {groupHours
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((hour) => (
                      <div
                        key={hour.id}
                        className={`border rounded-lg p-4 ${
                          !hour.is_active ? 'bg-gray-50 opacity-60' : ''
                        }`}
                      >
                        {editingId === hour.id ? (
                          // Edit Mode
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-semibold mb-1">
                                Giorno
                              </label>
                              <select
                                value={hour.day_of_week}
                                onChange={(e) =>
                                  updateHourField(
                                    hour.id,
                                    'day_of_week',
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg"
                              >
                                {DAYS.map((day, index) => (
                                  <option key={index} value={index}>
                                    {day}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">
                                Inizio
                              </label>
                              <input
                                type="time"
                                value={hour.start_time}
                                onChange={(e) =>
                                  updateHourField(
                                    hour.id,
                                    'start_time',
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-1">
                                Fine
                              </label>
                              <input
                                type="time"
                                value={hour.end_time}
                                onChange={(e) =>
                                  updateHourField(
                                    hour.id,
                                    'end_time',
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            <div className="flex items-end space-x-2">
                              <button
                                onClick={() => handleUpdate(hour.id)}
                                className="bg-green-500 text-white px-3 py-2 rounded-lg flex-1"
                              >
                                <FaSave />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  fetchData();
                                }}
                                className="bg-gray-500 text-white px-3 py-2 rounded-lg flex-1"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="font-semibold text-[var(--primary)] w-24">
                                {DAYS[hour.day_of_week]}
                              </span>
                              <span className="text-[var(--text-secondary)]">
                                {hour.start_time.substring(0, 5)} -{' '}
                                {hour.end_time.substring(0, 5)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleActive(hour.id)}
                                className={`p-2 rounded-lg ${
                                  hour.is_active
                                    ? 'text-green-500'
                                    : 'text-gray-400'
                                }`}
                              >
                                {hour.is_active ? (
                                  <FaToggleOn size={24} />
                                ) : (
                                  <FaToggleOff size={24} />
                                )}
                              </button>
                              <button
                                onClick={() => setEditingId(hour.id)}
                                className="bg-blue-500 text-white p-2 rounded-lg"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(hour.id)}
                                className="bg-red-500 text-white p-2 rounded-lg"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}