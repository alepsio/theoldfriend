'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaCut,
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

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
  order_position: number;
}

export default function AdminServices() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/services', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          order_position: services.length,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormData({ name: '', description: '', price: '', duration: '' });
        fetchServices();
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      const service = services.find((s) => s.id === id);
      if (!service) return;

      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: service.name,
          description: service.description,
          price: parseFloat(service.price),
          duration: service.duration,
          order_position: service.order_position,
          is_active: service.is_active, // ✅ Mantieni lo stato attivo/inattivo
        }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchServices();
      }
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo servizio?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      console.log('Deleting service:', id);
      
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        console.log('Service deleted successfully');
        fetchServices();
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        alert('Errore: ' + (errorData.error || 'Impossibile eliminare il servizio'));
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Errore di rete durante l\'eliminazione');
    }
  };

  const updateServiceField = (id: number, field: keyof Service, value: any) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
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
                  Gestione Servizi
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Modifica servizi e prezzi
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
              <span>Aggiungi Servizio</span>
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
              Nuovo Servizio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  placeholder="Es: Taglio Classico"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  Prezzo (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  placeholder="25.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  Durata (minuti) *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  placeholder="30"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  Descrizione
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  rows={3}
                  placeholder="Descrizione del servizio..."
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
                    name: '',
                    description: '',
                    price: '',
                    duration: '',
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

        {/* Services List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--secondary)]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                {editingId === service.id ? (
                  // Edit Mode
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) =>
                            updateServiceField(service.id, 'name', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                          Prezzo (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={service.price}
                          onChange={(e) =>
                            updateServiceField(service.id, 'price', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                          Durata (minuti)
                        </label>
                        <input
                          type="number"
                          value={service.duration}
                          onChange={(e) =>
                            updateServiceField(
                              service.id,
                              'duration',
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                          Stato
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateServiceField(service.id, 'is_active', !service.is_active)
                          }
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                            service.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {service.is_active ? (
                            <>
                              <FaToggleOn className="text-2xl" />
                              <span>Attivo</span>
                            </>
                          ) : (
                            <>
                              <FaToggleOff className="text-2xl" />
                              <span>Disattivato</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                          Descrizione
                        </label>
                        <textarea
                          value={service.description || ''}
                          onChange={(e) =>
                            updateServiceField(
                              service.id,
                              'description',
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdate(service.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <FaSave />
                        <span>Salva</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditingId(null);
                          fetchServices();
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <FaTimes />
                        <span>Annulla</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FaCut className="text-[var(--secondary)] text-xl" />
                        <h3 className="text-xl font-bold text-[var(--primary)]">
                          {service.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            service.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {service.is_active ? 'Attivo' : 'Disattivato'}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-[var(--text-secondary)] mb-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-[var(--secondary)] font-bold text-lg">
                          €{Number(service.price).toFixed(2)}
                        </span>
                        <span className="text-[var(--text-secondary)]">
                          {service.duration} minuti
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingId(service.id)}
                        className="bg-blue-500 text-white p-3 rounded-lg"
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(service.id)}
                        className="bg-red-500 text-white p-3 rounded-lg"
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}