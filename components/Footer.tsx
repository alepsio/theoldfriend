'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCut, FaInstagram, FaFacebook, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useEffect, useState } from 'react';

const Footer = () => {
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

  return (
    <footer className="bg-[var(--primary)] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 mb-4"
            >
              <FaCut className="text-[var(--secondary)] text-3xl" />
              <h3
                className="text-2xl font-bold"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {settings.shop_name || 'The Old Friend'}
              </h3>
            </motion.div>
            <p className="text-gray-300 leading-relaxed">
              {settings.shop_description || 'La tua barberia di fiducia dal 1950. Tradizione, stile e professionalità per un look sempre impeccabile.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-xl font-bold mb-4 text-[var(--secondary)]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Link Rapidi
            </h4>
            <ul className="space-y-2">
              {['Home', 'Chi Siamo', 'Servizi', 'Gallery', 'Contatti'].map((item) => (
                <li key={item}>
                  <Link
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-[var(--secondary)] transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              className="text-xl font-bold mb-4 text-[var(--secondary)]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Contatti
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <FaPhone className="text-[var(--secondary)]" />
                <span className="text-gray-300">{settings.phone || '+39 123 456 7890'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-[var(--secondary)]" />
                <span className="text-gray-300">{settings.email || 'info@theoldfriend.it'}</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-6">
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-[var(--secondary)] rounded-full flex items-center justify-center hover:bg-white hover:text-[var(--primary)] transition-all duration-300"
              >
                <FaInstagram />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-[var(--secondary)] rounded-full flex items-center justify-center hover:bg-white hover:text-[var(--primary)] transition-all duration-300"
              >
                <FaFacebook />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} The Old Friend. Tutti i diritti riservati.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-[var(--secondary)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-[var(--secondary)] transition-colors">
                Termini e Condizioni
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;