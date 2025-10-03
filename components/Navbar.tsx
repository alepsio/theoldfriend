'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Chi Siamo', href: '#about' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contatti', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-lg py-4'
          : 'bg-gradient-to-b from-black/50 to-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl md:text-3xl font-bold"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              <span className={scrolled ? 'text-[var(--primary)]' : 'text-white'}>The Old</span>
              <span className="text-[var(--secondary)]"> Friend</span>
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  scrolled 
                    ? 'text-[var(--text-primary)]' 
                    : 'text-white'
                } hover:text-[var(--secondary)] transition-colors duration-300 font-medium uppercase text-sm tracking-wider`}
              >
                {item.name}
              </Link>
            ))}
            <Link href="#booking">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Prenota Ora
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden text-2xl z-[70] relative transition-all duration-300 p-2 rounded-lg ${
              scrolled 
                ? 'text-[var(--primary)] hover:bg-gray-100' 
                : 'text-white bg-black/30 backdrop-blur-sm hover:bg-black/50'
            }`}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-[55]"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white md:hidden z-[60] shadow-2xl overflow-y-auto pt-20"
            >
              {/* Close Button */}
              <div className="flex justify-end px-6 pb-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[var(--primary)] text-3xl hover:text-[var(--secondary)] transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex flex-col items-start px-8 py-4 space-y-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block text-xl text-[var(--text-primary)] hover:text-[var(--secondary)] transition-colors duration-300 font-medium py-2 border-b border-gray-200"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Prenota Button */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  className="w-full pt-4"
                >
                  <Link href="#booking" onClick={() => setIsOpen(false)}>
                    <button className="btn-primary w-full text-base">
                      Prenota Ora
                    </button>
                  </Link>
                </motion.div>
              </div>

              {/* Decorative Element */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="text-center">
                  <p className="text-[var(--primary)] font-bold text-2xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    The Old <span className="text-[var(--secondary)]">Friend</span>
                  </p>
                  <p className="text-gray-500 text-sm">Barbershop & Grooming</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;