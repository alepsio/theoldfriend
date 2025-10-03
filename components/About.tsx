'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { FaAward, FaClock, FaUsers, FaHeart } from 'react-icons/fa';

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: <FaAward className="text-4xl" />,
      title: 'Esperienza',
      description: 'Oltre 20 anni di tradizione nel settore',
    },
    {
      icon: <FaClock className="text-4xl" />,
      title: 'Puntualità',
      description: 'Rispettiamo il tuo tempo, sempre',
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: 'Professionalità',
      description: 'Staff qualificato e appassionato',
    },
    {
      icon: <FaHeart className="text-4xl" />,
      title: 'Passione',
      description: 'Amiamo quello che facciamo',
    },
  ];

  return (
    <section id="about" className="py-20 bg-[var(--surface)]" ref={ref}>
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
            Chi Siamo
          </h2>
          <div className="section-divider"></div>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto mt-6">
            The Old Friend non è solo una barberia, è un luogo dove tradizione e modernità si fondono per offrirti un'esperienza unica.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="vintage-border"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-[var(--accent)] to-[var(--secondary)] rounded-lg overflow-hidden shadow-2xl">
              <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                {/* Placeholder per immagine */}
                <div className="text-center">
                  <FaUsers className="mx-auto mb-4" />
                  <p className="text-xl font-light">La Nostra Storia</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3
              className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Una Tradizione di Stile
            </h3>
            <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
              Dal 1950, The Old Friend è sinonimo di qualità e professionalità nel mondo del grooming maschile. 
              Ogni taglio è un'opera d'arte, ogni cliente è un amico.
            </p>
            <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
              Il nostro team di barbieri esperti combina tecniche tradizionali con le ultime tendenze, 
              garantendo sempre un risultato impeccabile che rispecchia la tua personalità.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 text-[var(--secondary)]">
                <FaAward className="text-2xl" />
                <span className="font-semibold">Certificati</span>
              </div>
              <div className="flex items-center space-x-2 text-[var(--secondary)]">
                <FaUsers className="text-2xl" />
                <span className="font-semibold">5000+ Clienti Soddisfatti</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="text-center p-6 card"
            >
              <div className="text-[var(--secondary)] mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h4
                className="text-xl font-bold text-[var(--primary)] mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {feature.title}
              </h4>
              <p className="text-[var(--text-secondary)]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;