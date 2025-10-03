'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaUser,
  FaToggleOn,
  FaToggleOff,
  FaCut,
} from 'react-icons/fa';
import Link from 'next/link';

interface Barber {
  id: number;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  order_position: number;
}

interface Service {
  id: number;
  name: string;
  is_assigned: boolean;
}

export default function AdminBarbers() {
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
  });
  
  // Service management modal
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/barbers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBarbers(data);
      }
    } catch (error) {
      console.error('Error fetching barbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/barbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          is_active: true, // Nuovo barbiere attivo di default
          order_position: barbers.length,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormData({ name: '', description: '', image_url: '' });
        fetchBarbers();
      }
    } catch (error) {
      console.error('Error adding barber:', error);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      const barber = barbers.find((b) => b.id === id);
      if (!barber) return;

      const res = await fetch(`/api/admin/barbers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(barber),
      });

      if (res.ok) {
        setEditingId(null);
        fetchBarbers();
      }
    } catch (error) {
      console.error('Error updating barber:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questo barbiere?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/barbers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchBarbers();
      } else {
        const data = await res.json();
        alert(data.error || 'Errore durante l\'eliminazione');
      }
    } catch (error) {
      console.error('Error deleting barber:', error);
    }
  };

  const updateBarberField = (id: number, field: keyof Barber, value: any) => {
    setBarbers(
      barbers.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const openServicesModal = async (barberId: number) => {
    setSelectedBarberId(barberId);
    setShowServicesModal(true);
    setLoadingServices(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/barber-services?barber_id=${barberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const toggleService = (serviceId: number) => {
    setServices(
      services.map((s) =>
        s.id === serviceId ? { ...s, is_assigned: !s.is_assigned } : s
      )
    );
  };

  const saveBarberServices = async () => {
    if (!selectedBarberId) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const assignedServiceIds = services
        .filter((s) => s.is_assigned)
        .map((s) => s.id);
      
      const res = await fetch('/api/admin/barber-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          barber_id: selectedBarberId,
          service_ids: assignedServiceIds,
        }),
      });
      
      if (res.ok) {
        setShowServicesModal(false);
        setSelectedBarberId(null);
        alert('Servizi aggiornati con successo!');
      } else {
        alert('Errore durante l\'aggiornamento dei servizi');
      }
    } catch (error) {
      console.error('Error saving barber services:', error);
      alert('Errore durante l\'aggiornamento dei servizi');
    }
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
                  Gestione Barbieri
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Gestisci il team
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
              <span>Aggiungi Barbiere</span>
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
              Nuovo Barbiere
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
                  placeholder="Es: Marco Rossi"
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
                  placeholder="Breve descrizione del barbiere..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  URL Immagine
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  placeholder="https://..."
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
                  setFormData({ name: '', description: '', image_url: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FaTimes />
                <span>Annulla</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Barbers List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--secondary)]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {barbers.map((barber, index) => (
              <motion.div
                key={barber.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                {editingId === barber.id ? (
                  // Edit Mode
                  <div>
                    <div className="space-y-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={barber.name}
                          onChange={(e) =>
                            updateBarberField(barber.id, 'name', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                          Descrizione
                        </label>
                        <textarea
                          value={barber.description || ''}
                          onChange={(e) =>
                            updateBarberField(barber.id, 'description', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                          URL Immagine
                        </label>
                        <input
                          type="text"
                          value={barber.image_url || ''}
                          onChange={(e) =>
                            updateBarberField(barber.id, 'image_url', e.target.value)
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
                            updateBarberField(barber.id, 'is_active', !barber.is_active)
                          }
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                            barber.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {barber.is_active ? (
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
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdate(barber.id)}
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
                          fetchBarbers();
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
                  <div>
                    <div className="flex items-start space-x-4 mb-4">
                      {barber.image_url ? (
                        <img
                          src={barber.image_url}
                          alt={barber.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-[var(--secondary)] flex items-center justify-center">
                          <FaUser className="text-white text-3xl" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-bold text-[var(--primary)]">
                            {barber.name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              barber.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {barber.is_active ? 'Attivo' : 'Disattivato'}
                          </span>
                        </div>
                        {barber.description && (
                          <p className="text-[var(--text-secondary)] text-sm">
                            {barber.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingId(barber.id)}
                          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                        >
                          <FaEdit />
                          <span>Modifica</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(barber.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openServicesModal(barber.id)}
                        className="w-full bg-[var(--secondary)] text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                      >
                        <FaCut />
                        <span>Gestisci Servizi</span>
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Services Management Modal */}
      {showServicesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="bg-[var(--primary)] text-white p-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Gestisci Servizi
              </h2>
              <p className="text-sm opacity-90 mt-1">
                Seleziona i servizi che questo barbiere può eseguire
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
              {loadingServices ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--secondary)]"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <motion.div
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        service.is_assigned
                          ? 'border-[var(--secondary)] bg-[var(--secondary)] bg-opacity-10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleService(service.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                              service.is_assigned
                                ? 'bg-[var(--secondary)] border-[var(--secondary)]'
                                : 'border-gray-300'
                            }`}
                          >
                            {service.is_assigned && (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          <span className="font-semibold text-[var(--primary)]">
                            {service.name}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveBarberServices}
                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <FaSave />
                <span>Salva Modifiche</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowServicesModal(false);
                  setSelectedBarberId(null);
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <FaTimes />
                <span>Annulla</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}