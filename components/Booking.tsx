'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { Service, Barber, TimeSlot } from '@/types';
import { format, addDays, addMinutes, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import { FaCheck, FaSpinner, FaPlus, FaTrash, FaCut } from 'react-icons/fa';
import BookingCalendar from './BookingCalendar';

// Fallback UUID generator for non-secure contexts (HTTP)
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface ServiceBooking {
  id: string;
  service_id: number;
  barber_id: number;
  service?: Service;
  barber?: Barber;
  availableBarbers?: Barber[];
}

const Booking = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [allBarbers, setAllBarbers] = useState<Barber[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<any>({});

  // Multi-service bookings
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([
    { id: generateUUID(), service_id: 0, barber_id: 0 },
  ]);

  const [formData, setFormData] = useState({
    booking_date: format(new Date(), 'yyyy-MM-dd'),
    booking_time: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    notes: '',
  });

  useEffect(() => {
    fetchSettings();
    fetchServices();
    fetchAllBarbers();
  }, []);

  // Fetch available barbers when service is selected
  useEffect(() => {
    serviceBookings.forEach((booking) => {
      if (booking.service_id && !booking.availableBarbers) {
        fetchBarbersForService(booking.id, booking.service_id);
      }
    });
  }, [serviceBookings]);

  // Fetch available slots when all services and barbers are selected
  useEffect(() => {
    const allSelected = serviceBookings.every(
      (b) => b.service_id && b.barber_id
    );
    if (allSelected && formData.booking_date) {
      fetchAvailableSlots();
    }
  }, [serviceBookings, formData.booking_date]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/public/settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/public/services');
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const fetchAllBarbers = async () => {
    try {
      const response = await fetch('/api/public/barbers');
      const data = await response.json();
      setAllBarbers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching barbers:', error);
      setAllBarbers([]);
    }
  };

  const fetchBarbersForService = async (bookingId: string, serviceId: number) => {
    try {
      const response = await fetch(`/api/public/barbers-by-service?service_id=${serviceId}`);
      const data = await response.json();
      const barbers = Array.isArray(data) ? data : [];
      
      setServiceBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, availableBarbers: barbers, barber_id: 0 }
            : b
        )
      );
    } catch (error) {
      console.error('Error fetching barbers for service:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      
      // Calculate total duration and check availability for sequential bookings
      let totalDuration = 0;
      const bookingDetails = serviceBookings.map((booking) => {
        const service = services.find((s) => s.id === booking.service_id);
        totalDuration += service?.duration || 0;
        return {
          barber_id: booking.barber_id,
          service_id: booking.service_id,
          duration: service?.duration || 0,
        };
      });

      // For now, we'll use the first barber's availability as base
      // In a more complex implementation, we'd check all barbers' availability
      const firstBooking = bookingDetails[0];
      const response = await fetch(
        `/api/public/available-slots?barber_id=${firstBooking.barber_id}&date=${formData.booking_date}&service_id=${firstBooking.service_id}&total_duration=${totalDuration}`
      );
      const data = await response.json();
      setAvailableSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingGroupId = generateUUID();
      
      // Calculate sequential times for each booking
      let currentTime = formData.booking_time;
      const bookingsToCreate = serviceBookings.map((booking) => {
        const service = services.find((s) => s.id === booking.service_id);
        const bookingData = {
          service_id: booking.service_id,
          barber_id: booking.barber_id,
          booking_date: formData.booking_date,
          booking_time: currentTime,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email,
          notes: formData.notes,
          booking_group_id: bookingGroupId,
        };
        
        // Calculate next time slot
        if (service?.duration) {
          const [hours, minutes] = currentTime.split(':').map(Number);
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          const nextDate = addMinutes(date, service.duration);
          currentTime = format(nextDate, 'HH:mm');
        }
        
        return bookingData;
      });

      // Create all bookings
      const responses = await Promise.all(
        bookingsToCreate.map((booking) =>
          fetch('/api/public/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking),
          })
        )
      );

      const allSuccessful = responses.every((res) => res.ok);

      if (allSuccessful) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setStep(1);
          setServiceBookings([
            { id: generateUUID(), service_id: 0, barber_id: 0 },
          ]);
          setFormData({
            booking_date: format(new Date(), 'yyyy-MM-dd'),
            booking_time: '',
            customer_name: '',
            customer_phone: '',
            customer_email: '',
            notes: '',
          });
        }, 3000);
      } else {
        alert('Errore durante la creazione di alcune prenotazioni');
      }
    } catch (error) {
      console.error('Error creating bookings:', error);
      alert('Errore durante la prenotazione');
    } finally {
      setLoading(false);
    }
  };

  const addServiceBooking = () => {
    setServiceBookings([
      ...serviceBookings,
      { id: generateUUID(), service_id: 0, barber_id: 0 },
    ]);
  };

  const removeServiceBooking = (id: string) => {
    if (serviceBookings.length > 1) {
      setServiceBookings(serviceBookings.filter((b) => b.id !== id));
    }
  };

  const updateServiceBooking = (
    id: string,
    field: 'service_id' | 'barber_id',
    value: number
  ) => {
    setServiceBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          if (field === 'service_id') {
            // Reset barber when service changes
            return { ...b, service_id: value, barber_id: 0, availableBarbers: undefined };
          }
          return { ...b, [field]: value };
        }
        return b;
      })
    );
  };

  const nextStep = () => {
    if (step === 1) {
      const allServicesSelected = serviceBookings.every((b) => b.service_id);
      if (!allServicesSelected) {
        alert('Seleziona un servizio per ogni prenotazione');
        return;
      }
    }
    if (step === 2) {
      const allBarbersSelected = serviceBookings.every((b) => b.barber_id);
      if (!allBarbersSelected) {
        alert('Seleziona un barbiere per ogni servizio');
        return;
      }
    }
    if (step === 3 && !formData.booking_time) {
      alert('Seleziona un orario');
      return;
    }
    setStep(step + 1);
  };

  const getTotalPrice = () => {
    return serviceBookings.reduce((total, booking) => {
      const service = services.find((s) => s.id === booking.service_id);
      return total + Number(service?.price || 0);
    }, 0);
  };

  const getTotalDuration = () => {
    return serviceBookings.reduce((total, booking) => {
      const service = services.find((s) => s.id === booking.service_id);
      return total + (service?.duration || 0);
    }, 0);
  };

  if (success) {
    return (
      <section id="booking" className="py-20 bg-[var(--background)]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center bg-white p-12 rounded-lg shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaCheck className="text-white text-4xl" />
            </motion.div>
            <h3
              className="text-3xl font-bold text-[var(--primary)] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Prenotazione Confermata!
            </h3>
            <p className="text-lg text-[var(--text-secondary)]">
              Ti aspettiamo! Riceverai una conferma via SMS/Email.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-20 bg-[var(--background)]" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--primary)] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Prenota il Tuo Appuntamento
          </h2>
          <div className="section-divider"></div>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto mt-6">
            Prenota uno o più servizi in sequenza. Scegli i servizi, i barbieri e l'orario che preferisci.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    step >= s
                      ? 'bg-[var(--secondary)] text-white scale-110'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                      step > s ? 'bg-[var(--secondary)]' : 'bg-gray-300'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm font-semibold text-[var(--text-secondary)]">
            <span>Servizi</span>
            <span>Barbieri</span>
            <span>Data & Ora</span>
            <span>Conferma</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-2xl"
        >
          <form onSubmit={handleSubmit}>
            {/* Step 1: Seleziona Servizi */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h3
                  className="text-2xl font-bold text-[var(--primary)] mb-6"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Seleziona i Servizi
                </h3>

                <div className="space-y-6">
                  {serviceBookings.map((booking, index) => (
                    <div
                      key={booking.id}
                      className="border-2 border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg text-[var(--primary)] flex items-center space-x-2">
                          <FaCut className="text-[var(--secondary)]" />
                          <span>Servizio {index + 1}</span>
                        </h4>
                        {serviceBookings.length > 1 && (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeServiceBooking(booking.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </motion.button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((service) => (
                          <motion.div
                            key={service.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              updateServiceBooking(booking.id, 'service_id', service.id)
                            }
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                              booking.service_id === service.id
                                ? 'border-[var(--secondary)] bg-[var(--secondary)]/10'
                                : 'border-gray-300 hover:border-[var(--secondary)]'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-bold text-[var(--primary)]">
                                {service.name}
                              </h5>
                              <span className="text-[var(--secondary)] font-bold">
                                €{service.price}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mb-1">
                              {service.description}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              Durata: {service.duration} min
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addServiceBooking}
                  className="mt-6 w-full bg-[var(--accent)] text-[var(--primary)] px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 border-2 border-[var(--secondary)]"
                >
                  <FaPlus />
                  <span>Aggiungi Altro Servizio</span>
                </motion.button>

                {serviceBookings.some((b) => b.service_id) && (
                  <div className="mt-6 p-4 bg-[var(--accent)] rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[var(--primary)]">
                        Totale Stimato:
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[var(--secondary)]">
                          €{getTotalPrice().toFixed(2)}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          Durata: {getTotalDuration()} min
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Seleziona Barbieri */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h3
                  className="text-2xl font-bold text-[var(--primary)] mb-6"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Scegli i Barbieri
                </h3>

                <div className="space-y-6">
                  {serviceBookings.map((booking, index) => {
                    const service = services.find((s) => s.id === booking.service_id);
                    const barbers = booking.availableBarbers || [];

                    return (
                      <div
                        key={booking.id}
                        className="border-2 border-gray-200 rounded-lg p-6"
                      >
                        <h4 className="font-bold text-lg text-[var(--primary)] mb-4">
                          Barbiere per: {service?.name}
                        </h4>

                        {barbers.length === 0 ? (
                          <div className="text-center py-8">
                            <FaSpinner className="animate-spin text-4xl text-[var(--secondary)] mx-auto mb-4" />
                            <p className="text-[var(--text-secondary)]">
                              Caricamento barbieri disponibili...
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {barbers.map((barber) => (
                              <motion.div
                                key={barber.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  updateServiceBooking(booking.id, 'barber_id', barber.id)
                                }
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                                  booking.barber_id === barber.id
                                    ? 'border-[var(--secondary)] bg-[var(--secondary)]/10'
                                    : 'border-gray-300 hover:border-[var(--secondary)]'
                                }`}
                              >
                                <div className="flex items-center space-x-4">
                                  {barber.image_url ? (
                                    <img
                                      src={barber.image_url}
                                      alt={barber.name}
                                      className="w-16 h-16 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-[var(--accent)] rounded-full"></div>
                                  )}
                                  <div>
                                    <h5 className="font-bold text-[var(--primary)]">
                                      {barber.name}
                                    </h5>
                                    <p className="text-xs text-[var(--text-secondary)]">
                                      {barber.description}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Seleziona Data e Ora */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h3
                  className="text-2xl font-bold text-[var(--primary)] mb-6"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Seleziona Data e Orario
                </h3>

                {/* Summary */}
                <div className="mb-6 p-4 bg-[var(--accent)] rounded-lg">
                  <h4 className="font-semibold text-[var(--primary)] mb-3">
                    Riepilogo Servizi:
                  </h4>
                  <div className="space-y-2">
                    {serviceBookings.map((booking, index) => {
                      const service = services.find((s) => s.id === booking.service_id);
                      const barber = booking.availableBarbers?.find(
                        (b) => b.id === booking.barber_id
                      );
                      return (
                        <div
                          key={booking.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <span>
                            {index + 1}. {service?.name} con {barber?.name}
                          </span>
                          <span className="font-semibold">
                            {service?.duration} min - €{service?.price}
                          </span>
                        </div>
                      );
                    })}
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                      <span>Totale:</span>
                      <span>
                        {getTotalDuration()} min - €{getTotalPrice()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calendar Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                    Seleziona la Data
                  </label>
                  <BookingCalendar
                    selectedDate={formData.booking_date}
                    onDateSelect={(date) =>
                      setFormData({ ...formData, booking_date: date, booking_time: '' })
                    }
                    maxAdvanceDays={settings.booking_advance_days || 14}
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                    Orario Disponibile (inizio primo servizio)
                  </label>
                  {loading ? (
                    <div className="text-center py-8">
                      <FaSpinner className="animate-spin text-4xl text-[var(--secondary)] mx-auto" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-center text-[var(--text-secondary)] py-8">
                      Nessun orario disponibile per questa data
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {availableSlots.map((slot) => (
                        <motion.button
                          key={slot.time}
                          type="button"
                          whileHover={slot.available ? { scale: 1.05 } : {}}
                          whileTap={slot.available ? { scale: 0.95 } : {}}
                          disabled={!slot.available}
                          onClick={() =>
                            setFormData({ ...formData, booking_time: slot.time })
                          }
                          className={`p-3 rounded-lg font-semibold transition-all duration-300 ${
                            !slot.available
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : formData.booking_time === slot.time
                              ? 'bg-[var(--secondary)] text-white'
                              : 'bg-white border-2 border-gray-300 hover:border-[var(--secondary)]'
                          }`}
                        >
                          {slot.time}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Dati Cliente */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <h3
                  className="text-2xl font-bold text-[var(--primary)] mb-6"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  I Tuoi Dati
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_name: e.target.value })
                      }
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none"
                      placeholder="Mario Rossi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Telefono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customer_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_phone: e.target.value })
                      }
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none"
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Email (opzionale)
                    </label>
                    <input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_email: e.target.value })
                      }
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none"
                      placeholder="mario.rossi@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Note (opzionale)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[var(--secondary)] focus:outline-none"
                      placeholder="Eventuali richieste particolari..."
                    />
                  </div>
                </div>

                {/* Final Summary */}
                <div className="mt-6 p-6 bg-[var(--accent)] rounded-lg border-2 border-[var(--secondary)]">
                  <h4 className="font-bold text-lg text-[var(--primary)] mb-4">
                    Riepilogo Finale
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Data:</span>
                      <span className="font-semibold">
                        {format(new Date(formData.booking_date), 'EEEE d MMMM yyyy', {
                          locale: it,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Orario inizio:</span>
                      <span className="font-semibold">{formData.booking_time}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      {serviceBookings.map((booking, index) => {
                        const service = services.find((s) => s.id === booking.service_id);
                        const barber = booking.availableBarbers?.find(
                          (b) => b.id === booking.barber_id
                        );
                        return (
                          <div key={booking.id} className="flex justify-between py-1">
                            <span>
                              {index + 1}. {service?.name} - {barber?.name}
                            </span>
                            <span className="font-semibold">€{Number(service?.price || 0).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span>Totale:</span>
                      <span className="text-[var(--secondary)]">€{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(step - 1)}
                  className="btn-secondary"
                >
                  Indietro
                </motion.button>
              )}
              {step < 4 ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextStep}
                  className="btn-primary ml-auto"
                >
                  Avanti
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  className="btn-primary ml-auto flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Prenotazione...</span>
                    </>
                  ) : (
                    <span>Conferma Prenotazione</span>
                  )}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Booking;