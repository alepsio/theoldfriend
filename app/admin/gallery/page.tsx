'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaImages,
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaTimes,
  FaUpload,
} from 'react-icons/fa';
import Link from 'next/link';

interface GalleryImage {
  id: number;
  image_url: string;
  title: string;
  description: string;
  order_position: number;
  is_active: boolean;
}

export default function AdminGallery() {
  const router = useRouter();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    description: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/gallery', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.image_url || !formData.title) {
      alert('URL immagine e titolo sono obbligatori');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          order_position: images.length,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormData({ image_url: '', title: '', description: '' });
        fetchImages();
      } else {
        const errorData = await res.json();
        alert('Errore: ' + (errorData.error || 'Impossibile aggiungere l\'immagine'));
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Errore di rete durante l\'aggiunta');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Sei sicuro di voler eliminare questa immagine?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchImages();
      } else {
        const errorData = await res.json();
        alert('Errore: ' + (errorData.error || 'Impossibile eliminare l\'immagine'));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Errore di rete durante l\'eliminazione');
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('admin_token');
      const image = images.find((img) => img.id === id);
      if (!image) return;

      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...image,
          is_active: !currentStatus,
        }),
      });

      if (res.ok) {
        fetchImages();
      } else {
        const errorData = await res.json();
        alert('Errore: ' + (errorData.error || 'Impossibile aggiornare lo stato'));
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      alert('Errore di rete durante l\'aggiornamento');
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
                  Gestione Gallery
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Gestisci le immagini della galleria
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
              <span>Aggiungi Immagine</span>
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
              Nuova Immagine
            </h3>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  URL Immagine *
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  placeholder="https://esempio.com/immagine.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puoi usare servizi come Imgur, Cloudinary o caricare su un server
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--primary)] mb-2">
                  Titolo *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--secondary)] focus:border-transparent"
                  placeholder="Es: Taglio Moderno"
                />
              </div>
              <div>
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
                  placeholder="Descrizione dell'immagine..."
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
                <FaUpload />
                <span>Aggiungi</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ image_url: '', title: '', description: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FaTimes />
                <span>Annulla</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--secondary)]"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <FaImages className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nessuna immagine nella gallery</p>
            <p className="text-gray-400 text-sm">
              Clicca su "Aggiungi Immagine" per iniziare
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative h-64">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  {!image.is_active && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        NON ATTIVA
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[var(--primary)] mb-2">
                    {image.title}
                  </h3>
                  {image.description && (
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      {image.description}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleActive(image.id, image.is_active)}
                      className={`flex-1 px-4 py-2 rounded-lg text-white ${
                        image.is_active ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    >
                      {image.is_active ? 'Disattiva' : 'Attiva'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(image.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}