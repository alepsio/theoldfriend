'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaClock, FaEnvelope } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Importa la mappa dinamicamente per evitare problemi SSR
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-200">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--secondary)]"></div>
    </div>
  ),
});

const Location = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
    // Ricarica i settings ogni 30 secondi per riflettere le modifiche dall'admin
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/public/settings', {
        cache: 'no-store', // Evita cache del browser
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

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-3xl" />,
      title: 'Indirizzo',
      content: settings.address && settings.city && settings.postal_code 
        ? `${settings.address}, ${settings.postal_code} ${settings.city}`
        : 'Via Roma 123, 20100 Milano',
    },
    {
      icon: <FaPhone className="text-3xl" />,
      title: 'Telefono',
      content: settings.phone || '+39 123 456 7890',
    },
    {
      icon: <FaEnvelope className="text-3xl" />,
      title: 'Email',
      content: settings.email || 'info@theoldfriend.it',
    },
    {
      icon: <FaClock className="text-3xl" />,
      title: 'Orari',
      content: 'Lun-Ven: 9:00-19:00\nSab: 9:00-13:00',
    },
  ];

  return (
    <section id="contact" className="py-20 bg-[var(--surface)]" ref={ref}>
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
            Dove Trovarci
          </h2>
          <div className="section-divider"></div>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto mt-6">
            Vieni a trovarci nel cuore della città. Ti aspettiamo!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ x: 10 }}
                className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-[var(--secondary)] flex-shrink-0">
                  {info.icon}
                </div>
                <div>
                  <h4
                    className="text-xl font-bold text-[var(--primary)] mb-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {info.title}
                  </h4>
                  <p className="text-[var(--text-secondary)] whitespace-pre-line">
                    {info.content}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="p-6 bg-[var(--primary)] rounded-lg text-white"
            >
              <h4
                className="text-xl font-bold mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Seguici sui Social
              </h4>
              <div className="flex space-x-4">
                <motion.a
                  href={settings.instagram_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 bg-[var(--secondary)] rounded-full flex items-center justify-center hover:bg-white hover:text-[var(--primary)] transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </motion.a>
                <motion.a
                  href={settings.facebook_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 bg-[var(--secondary)] rounded-full flex items-center justify-center hover:bg-white hover:text-[var(--primary)] transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-[500px] rounded-lg overflow-hidden shadow-2xl border-4 border-[var(--secondary)]"
          >
            <MapComponent
              latitude={parseFloat(settings.shop_latitude || '41.9028')}
              longitude={parseFloat(settings.shop_longitude || '12.4964')}
              shopName={settings.shop_name || 'The Old Friend'}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Location;