'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaCalendar,
  FaCut,
  FaUsers,
  FaCog,
  FaChartLine,
  FaSignOutAlt,
  FaImage,
  FaClock,
} from 'react-icons/fa';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalServices: 0,
    totalBarbers: 0,
    monthRevenue: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      // Fetch today's bookings
      const today = new Date().toISOString().split('T')[0];
      const bookingsRes = await fetch(`/api/admin/bookings?date=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!bookingsRes.ok) {
        console.error('Bookings API error:', bookingsRes.status);
      }
      const bookings = await bookingsRes.json();
      console.log('Today bookings:', bookings);

      // Fetch services
      const servicesRes = await fetch('/api/admin/services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!servicesRes.ok) {
        console.error('Services API error:', servicesRes.status);
      }
      const services = await servicesRes.json();
      console.log('Services:', services);

      // Fetch barbers
      const barbersRes = await fetch('/api/public/barbers');
      
      if (!barbersRes.ok) {
        console.error('Barbers API error:', barbersRes.status);
      }
      const barbers = await barbersRes.json();
      console.log('Barbers:', barbers);

      // Calculate month revenue
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      const monthStart = firstDayOfMonth.toISOString().split('T')[0];
      
      const monthBookingsRes = await fetch(`/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allBookings = await monthBookingsRes.json();
      
      // Filter bookings for current month and calculate revenue
      const monthRevenue = Array.isArray(allBookings) 
        ? allBookings
            .filter((b: any) => {
              const bookingDate = new Date(b.booking_date);
              return bookingDate >= firstDayOfMonth && 
                     (b.status === 'completed' || b.status === 'confirmed');
            })
            .reduce((sum: number, b: any) => sum + Number(b.service_price || 0), 0)
        : 0;

      setStats({
        todayBookings: Array.isArray(bookings) ? bookings.length : 0,
        totalServices: Array.isArray(services) ? services.length : 0,
        totalBarbers: Array.isArray(barbers) ? barbers.length : 0,
        monthRevenue: monthRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--secondary)]"></div>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'Prenotazioni',
      icon: <FaCalendar className="text-3xl" />,
      href: '/admin/bookings',
      color: 'from-blue-500 to-blue-600',
      description: 'Gestisci le prenotazioni',
    },
    {
      title: 'Servizi',
      icon: <FaCut className="text-3xl" />,
      href: '/admin/services',
      color: 'from-purple-500 to-purple-600',
      description: 'Modifica servizi e prezzi',
    },
    {
      title: 'Barbieri',
      icon: <FaUsers className="text-3xl" />,
      href: '/admin/barbers',
      color: 'from-green-500 to-green-600',
      description: 'Gestisci il team',
    },
    {
      title: 'Orari',
      icon: <FaClock className="text-3xl" />,
      href: '/admin/hours',
      color: 'from-orange-500 to-orange-600',
      description: 'Imposta orari di lavoro',
    },
    {
      title: 'Gallery',
      icon: <FaImage className="text-3xl" />,
      href: '/admin/gallery',
      color: 'from-pink-500 to-pink-600',
      description: 'Gestisci le immagini',
    },
    {
      title: 'Impostazioni',
      icon: <FaCog className="text-3xl" />,
      href: '/admin/settings',
      color: 'from-gray-500 to-gray-600',
      description: 'Configurazione generale',
    },
  ];

  const statsCards = [
    {
      title: 'Prenotazioni Oggi',
      value: stats.todayBookings,
      icon: <FaCalendar className="text-2xl" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Servizi Attivi',
      value: stats.totalServices,
      icon: <FaCut className="text-2xl" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Barbieri',
      value: stats.totalBarbers,
      icon: <FaUsers className="text-2xl" />,
      color: 'bg-green-500',
    },
    {
      title: 'Entrate Mese',
      value: `€${stats.monthRevenue}`,
      icon: <FaChartLine className="text-2xl" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[var(--secondary)] rounded-full flex items-center justify-center">
                <FaCut className="text-white text-xl" />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold text-[var(--primary)]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  The Old Friend
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Pannello Amministratore
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-[var(--primary)]">{user.username}</p>
                <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                <FaSignOutAlt />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2
            className="text-3xl font-bold text-[var(--primary)] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Benvenuto, {user.username}!
          </h2>
          <p className="text-[var(--text-secondary)]">
            Ecco una panoramica della tua attività
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[var(--primary)] mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Link href={item.href}>
                <div
                  className={`bg-gradient-to-br ${item.color} rounded-lg shadow-lg p-8 text-white cursor-pointer h-full`}
                >
                  <div className="mb-4">{item.icon}</div>
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/80">{item.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 bg-white rounded-lg shadow-lg p-6"
        >
          <h3
            className="text-2xl font-bold text-[var(--primary)] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Azioni Rapide
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary"
              >
                Visualizza Sito
              </motion.button>
            </Link>
            <Link href="/admin/bookings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Vedi Prenotazioni Oggi
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}