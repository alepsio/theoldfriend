'use client';

import { motion } from 'framer-motion';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface BookingCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  maxAdvanceDays?: number;
}

const BookingCalendar = ({ selectedDate, onDateSelect, maxAdvanceDays = 14 }: BookingCalendarProps) => {
  const today = startOfDay(new Date());
  const selected = new Date(selectedDate);
  const currentMonth = selected;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calcola i giorni del mese precedente da mostrare
  const startDayOfWeek = monthStart.getDay();
  const daysFromPrevMonth = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  
  const prevMonthDays = [];
  for (let i = daysFromPrevMonth; i > 0; i--) {
    prevMonthDays.push(addDays(monthStart, -i));
  }

  // Calcola i giorni del mese successivo da mostrare
  const endDayOfWeek = monthEnd.getDay();
  const daysFromNextMonth = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
  
  const nextMonthDays = [];
  for (let i = 1; i <= daysFromNextMonth; i++) {
    nextMonthDays.push(addDays(monthEnd, i));
  }

  const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const isDateSelectable = (date: Date) => {
    const daysDiff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff < maxAdvanceDays;
  };

  const handlePrevMonth = () => {
    const newDate = addDays(monthStart, -15);
    onDateSelect(format(newDate, 'yyyy-MM-dd'));
  };

  const handleNextMonth = () => {
    const newDate = addDays(monthEnd, 1);
    onDateSelect(format(newDate, 'yyyy-MM-dd'));
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      {/* Header con mese e anno */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 text-[var(--primary)]"
        >
          <FaChevronLeft />
        </motion.button>
        
        <h3 className="text-xl font-bold text-[var(--primary)]" style={{ fontFamily: 'Playfair Display, serif' }}>
          {format(currentMonth, 'MMMM yyyy', { locale: it })}
        </h3>
        
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 text-[var(--primary)]"
        >
          <FaChevronRight />
        </motion.button>
      </div>

      {/* Giorni della settimana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-[var(--text-secondary)] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Griglia dei giorni */}
      <div className="grid grid-cols-7 gap-2">
        {allDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelectedDay = isSameDay(day, selected);
          const isTodayDay = isToday(day);
          const isSelectable = isDateSelectable(day);
          const isPast = isBefore(day, today);

          return (
            <motion.button
              key={index}
              type="button"
              whileHover={isSelectable ? { scale: 1.1 } : {}}
              whileTap={isSelectable ? { scale: 0.95 } : {}}
              disabled={!isSelectable || !isCurrentMonth}
              onClick={() => {
                if (isSelectable && isCurrentMonth) {
                  onDateSelect(format(day, 'yyyy-MM-dd'));
                }
              }}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200
                ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                ${isPast && isCurrentMonth ? 'text-gray-400 cursor-not-allowed' : ''}
                ${isSelectable && isCurrentMonth && !isPast
                  ? 'hover:bg-[var(--secondary)]/10 cursor-pointer'
                  : ''
                }
                ${isSelectedDay && isCurrentMonth
                  ? 'bg-[var(--secondary)] text-white font-bold shadow-lg'
                  : ''
                }
                ${isTodayDay && !isSelectedDay && isCurrentMonth
                  ? 'border-2 border-[var(--secondary)] text-[var(--secondary)] font-bold'
                  : ''
                }
                ${!isSelectable && isCurrentMonth && !isPast
                  ? 'text-gray-300 cursor-not-allowed'
                  : ''
                }
              `}
            >
              {format(day, 'd')}
            </motion.button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-[var(--secondary)] rounded"></div>
          <span>Oggi</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[var(--secondary)] rounded"></div>
          <span>Selezionato</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span>Non disponibile</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;