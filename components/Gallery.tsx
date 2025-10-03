'use client';

import { motion, useAnimation } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { GalleryImage } from '@/types';
import { FaInstagram } from 'react-icons/fa';

const Gallery = () => {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/public/gallery');
      const data = await response.json();
      setGallery(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setGallery([]);
    }
  };

  // Placeholder images se non ci sono immagini nel DB
  const placeholderImages = [
    { id: 1, title: 'Taglio Classico', color: '#8b6f47' },
    { id: 2, title: 'Barba Perfetta', color: '#d4a574' },
    { id: 3, title: 'Stile Moderno', color: '#6b5d4f' },
    { id: 4, title: 'Grooming Deluxe', color: '#a0826d' },
    { id: 5, title: 'Taglio Bambino', color: '#c9a87c' },
    { id: 6, title: 'Trattamenti', color: '#8b7355' },
    { id: 7, title: 'Rasatura Tradizionale', color: '#9d8468' },
    { id: 8, title: 'Styling Premium', color: '#b89968' },
  ];

  const displayImages = gallery.length > 0 ? gallery : placeholderImages;
  
  // Duplica le immagini per creare l'effetto loop infinito
  const duplicatedImages = [...displayImages, ...displayImages, ...displayImages];

  return (
    <section id="gallery" className="py-20 bg-[var(--primary)] overflow-hidden relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            La Nostra Gallery
          </h2>
          <div className="section-divider !bg-[var(--secondary)]"></div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mt-6">
            Scopri alcuni dei nostri lavori e lasciati ispirare per il tuo prossimo look.
          </p>
        </motion.div>

        {/* Carosello Infinito Orizzontale */}
        <div className="relative">
          {/* Gradient Overlays per effetto fade */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-r from-[var(--primary)] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-32 bg-gradient-to-l from-[var(--primary)] to-transparent z-10 pointer-events-none"></div>

          {/* Carousel Container */}
          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <motion.div
              className="flex gap-4 md:gap-6"
              animate={{
                x: isPaused ? undefined : [0, -100 * displayImages.length / 3],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 30,
                  ease: 'linear',
                },
              }}
            >
              {duplicatedImages.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.05, zIndex: 20 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group cursor-pointer flex-shrink-0 w-[280px] h-[380px] sm:w-[320px] sm:h-[420px] md:w-[350px] md:h-[450px]"
                >
                  {/* Card Container */}
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                    {/* Background Image/Color */}
                    <div
                      className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                      style={{
                        background: 'color' in item ? item.color : 'var(--accent)',
                      }}
                    >
                      {'image_url' in item && item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title || 'Gallery Image'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <svg
                            className="w-32 h-32"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 md:p-6">
                      {/* Title */}
                      <motion.h3
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2 transform group-hover:translate-y-[-10px] transition-transform duration-300"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {'title' in item ? item.title : 'Gallery Image'}
                      </motion.h3>

                      {/* Decorative Line */}
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '50px' }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="h-1 bg-[var(--secondary)] mb-3 sm:mb-4 group-hover:w-full transition-all duration-500"
                      ></motion.div>

                      {/* Description (visible on hover) */}
                      <motion.p
                        className="text-gray-300 text-xs sm:text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                      >
                        Uno dei nostri lavori più apprezzati
                      </motion.p>
                    </div>

                    {/* Border Animation on Hover */}
                    <div className="absolute inset-0 border-4 border-[var(--secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                    {/* Corner Decorations */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-[var(--secondary)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"></div>
                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-[var(--secondary)] opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100"></div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </div>
                  </div>

                  {/* Floating Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-12 h-12 sm:w-16 sm:h-16 bg-[var(--secondary)] rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                  >
                    <span className="text-[var(--primary)] text-xl sm:text-2xl font-bold">✨</span>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Pause Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isPaused ? 1 : 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-semibold pointer-events-none z-20 max-w-[90%] text-center"
          >
            <span className="hidden sm:inline">Pausa - Passa il mouse per esplorare</span>
            <span className="sm:hidden">In Pausa</span>
          </motion.div>
        </div>

        {/* Instagram CTA con animazione */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-12 sm:mt-16 md:mt-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <FaInstagram className="text-white text-3xl sm:text-4xl" />
            </div>
          </motion.div>

          <p className="text-base sm:text-lg text-gray-300 mb-6 px-4">
            Seguici su Instagram per vedere tutti i nostri lavori quotidiani!
          </p>

          <motion.a
            href="https://instagram.com/theoldfriend"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(212, 165, 116, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-[var(--secondary)] text-[var(--primary)] px-6 py-3 sm:px-10 sm:py-4 font-bold uppercase tracking-wider rounded-full hover:bg-white transition-all duration-300 shadow-lg"
          >
            <span className="flex items-center gap-2 sm:gap-3">
              <FaInstagram className="text-xl sm:text-2xl" />
              <span className="text-sm sm:text-base">@theoldfriend</span>
            </span>
          </motion.a>
        </motion.div>
      </div>

      {/* Background Decorative Elements */}
      <div className="hidden md:block absolute top-20 left-10 w-32 h-32 border-4 border-[var(--secondary)]/20 rounded-full animate-pulse"></div>
      <div className="hidden md:block absolute bottom-20 right-10 w-40 h-40 border-4 border-[var(--secondary)]/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default Gallery;