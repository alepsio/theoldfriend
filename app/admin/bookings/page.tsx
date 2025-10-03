'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaCalendar,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaCut,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';
import Link from 'next/link';

interface Booking {
  id: number;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  barber_name: string;
  service_name: string;
  service_price: string;
  service_duration: number;
}

export default function AdminBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchBookings();
  }, [selectedDate, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      let url = `/api/admin/bookings?date=${selectedDate}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confermata';
      case 'pending':
        return 'In Attesa';
      case 'cancelled':
        return 'Cancellata';
      case 'completed':
        return 'Completata';
      default:
        return status;
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
                  Gestione Prenotazioni
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Visualizza e gestisci le prenotazioni
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                Data
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                Stato
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
              >
                <option value="all">Tutti</option>
                <option value="pending">In Attesa</option>
                <option value="confirmed">Confermate</option>
                <option value="completed">Completate</option>
                <option value="cancelled">Cancellate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--secondary)]"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--primary)] mb-2">
              Nessuna prenotazione trovata
            </h3>
            <p className="text-[var(--text-secondary)]">
              Non ci sono prenotazioni per i filtri selezionati
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Booking Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                      <div className="flex items-center text-[var(--text-secondary)]">
                        <FaClock className="mr-2" />
                        <span className="font-semibold">
                          {booking.booking_time}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center text-[var(--primary)] mb-2">
                          <FaUser className="mr-2" />
                          <span className="font-semibold">
                            {booking.customer_name}
                          </span>
                        </div>
                        <div className="flex items-center text-[var(--text-secondary)] text-sm mb-1">
                          <FaPhone className="mr-2" />
                          <span>{booking.customer_phone}</span>
                        </div>
                        {booking.customer_email && (
                          <div className="flex items-center text-[var(--text-secondary)] text-sm">
                            <FaEnvelope className="mr-2" />
                            <span>{booking.customer_email}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center text-[var(--primary)] mb-2">
                          <FaCut className="mr-2" />
                          <span className="font-semibold">
                            {booking.service_name}
                          </span>
                        </div>
                        <div className="text-[var(--text-secondary)] text-sm mb-1">
                          Barbiere: <span className="font-semibold">{booking.barber_name}</span>
                        </div>
                        <div className="text-[var(--text-secondary)] text-sm">
                          Durata: {booking.service_duration} min • €
                          {Number(booking.service_price).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-2">
                        <p className="text-sm text-[var(--text-secondary)]">
                          <span className="font-semibold">Note:</span>{' '}
                          {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {booking.status === 'pending' && (
                    <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 mt-4 lg:mt-0 lg:ml-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          updateBookingStatus(booking.id, 'confirmed')
                        }
                        className="flex-1 lg:flex-none bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                      >
                        <FaCheck className="mr-2" />
                        Conferma
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          updateBookingStatus(booking.id, 'cancelled')
                        }
                        className="flex-1 lg:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <FaTimes className="mr-2" />
                        Rifiuta
                      </motion.button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="mt-4 lg:mt-0 lg:ml-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          updateBookingStatus(booking.id, 'completed')
                        }
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Segna come Completata
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}