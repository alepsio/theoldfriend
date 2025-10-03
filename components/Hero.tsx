'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCut, FaStar } from 'react-icons/fa';

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--primary)] via-[#2a2a2a] to-[var(--accent)] z-10"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 animate-pulse">
          <FaCut className="text-[var(--secondary)] text-6xl rotate-45" />
        </div>
        <div className="absolute bottom-20 right-10 animate-pulse delay-100">
          <FaCut className="text-[var(--secondary)] text-6xl -rotate-45" />
        </div>
        <div className="absolute top-1/2 left-1/4 animate-pulse delay-200">
          <FaStar className="text-[var(--secondary)] text-4xl" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse delay-300">
          <FaStar className="text-[var(--secondary)] text-4xl" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative">
        <div className="text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="inline-block">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="h-px w-12 bg-[var(--secondary)]"></div>
                <FaCut className="text-[var(--secondary)] text-3xl" />
                <div className="h-px w-12 bg-[var(--secondary)]"></div>
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            The Old Friend
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl lg:text-3xl mb-4 text-[var(--secondary)] font-light tracking-wide"
          >
            Barbershop & Grooming
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-gray-300"
          >
            Dove tradizione e stile si incontrano. La tua barberia di fiducia per un look impeccabile.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="#booking">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[var(--secondary)] text-[var(--primary)] px-8 py-4 text-lg font-semibold uppercase tracking-wider hover:bg-[var(--accent)] transition-all duration-300 shadow-lg"
              >
                Prenota Ora
              </motion.button>
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 border-2 border-[var(--secondary)] rounded-full flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-2 bg-[var(--secondary)] rounded-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-[var(--secondary)] opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-[var(--secondary)] opacity-50"></div>
    </section>
  );
};

export default Hero;