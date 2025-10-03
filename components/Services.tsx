'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { FaCut, FaStar, FaChild } from 'react-icons/fa';
import { Service } from '@/types';

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/public/services');
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (index: number) => {
    const icons = [FaCut, FaCut, FaStar, FaCut, FaChild, FaStar];
    const Icon = icons[index % icons.length];
    return <Icon className="text-4xl" />;
  };

  return (
    <section id="services" className="py-20 bg-[var(--background)]" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--primary)] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            I Nostri Servizi
          </h2>
          <div className="section-divider"></div>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto mt-6">
            Scegli tra la nostra gamma di servizi professionali, pensati per soddisfare ogni tua esigenza di stile.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--secondary)]"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-[var(--text-secondary)]">
              Nessun servizio disponibile al momento. Il database deve essere configurato.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="card p-8 relative overflow-hidden group"
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--secondary)] opacity-10 transform rotate-45 translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500"></div>

                {/* Icon */}
                <div className="text-[var(--secondary)] mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {getServiceIcon(index)}
                </div>

                {/* Service Name */}
                <h3
                  className="text-2xl font-bold text-[var(--primary)] mb-3"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {service.name}
                </h3>

                {/* Description */}
                {service.description && (
                  <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
                    {service.description}
                  </p>
                )}

                {/* Duration */}
                <div className="flex items-center text-[var(--text-secondary)] mb-4">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{service.duration} minuti</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-[var(--border)]">
                  <span
                    className="text-3xl font-bold text-[var(--secondary)]"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    €{Number(service.price).toFixed(2)}
                  </span>
                  <motion.a
                    href="#booking"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[var(--primary)] text-white px-6 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition-all duration-300"
                  >
                    Prenota
                  </motion.a>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 border-2 border-[var(--secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-[var(--text-secondary)] mb-6">
            Non trovi quello che cerchi? Contattaci per servizi personalizzati!
          </p>
          <a href="#contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
            >
              Contattaci
            </motion.button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;