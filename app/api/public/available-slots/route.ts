import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { format, parse, addMinutes, isAfter, isBefore } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const barberId = searchParams.get('barber_id');
    const date = searchParams.get('date');
    const serviceId = searchParams.get('service_id');

    if (!barberId || !date || !serviceId) {
      return NextResponse.json(
        { error: 'Parametri mancanti' },
        { status: 400 }
      );
    }

    // Ottieni le impostazioni
    const [settingsRows] = await pool.query<RowDataPacket[]>(
      'SELECT booking_slot_duration FROM settings WHERE id = 1'
    );
    const slotDuration = settingsRows.length > 0 ? settingsRows[0].booking_slot_duration : 30;

    // Ottieni la durata del servizio
    const [serviceRows] = await pool.query<RowDataPacket[]>(
      'SELECT duration FROM services WHERE id = ?',
      [serviceId]
    );

    if (serviceRows.length === 0) {
      return NextResponse.json(
        { error: 'Servizio non trovato' },
        { status: 404 }
      );
    }

    const serviceDuration = serviceRows[0].duration;

    // Ottieni il giorno della settimana (0 = Domenica, 1 = Lunedì, ecc.)
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Ottieni gli orari di lavoro del barbiere per quel giorno
    const [workingHoursRows] = await pool.query<RowDataPacket[]>(
      'SELECT start_time, end_time FROM working_hours WHERE barber_id = ? AND day_of_week = ? AND is_active = TRUE',
      [barberId, dayOfWeek]
    );

    if (workingHoursRows.length === 0) {
      return NextResponse.json([]);
    }

    const { start_time, end_time } = workingHoursRows[0];

    // Verifica se è un giorno di chiusura
    const [closureRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM closures WHERE (barber_id = ? OR barber_id IS NULL) AND closure_date = ?',
      [barberId, date]
    );

    if (closureRows.length > 0) {
      return NextResponse.json([]);
    }

    // Ottieni le prenotazioni esistenti per quel giorno e barbiere
    const [bookingsRows] = await pool.query<RowDataPacket[]>(
      `SELECT b.booking_time, s.duration 
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       WHERE b.barber_id = ? AND b.booking_date = ? AND b.status != 'cancelled'`,
      [barberId, date]
    );

    // Genera gli slot disponibili
    const slots = [];
    let currentTime = parse(start_time, 'HH:mm:ss', new Date());
    const endTime = parse(end_time, 'HH:mm:ss', new Date());

    while (isBefore(currentTime, endTime)) {
      const timeString = format(currentTime, 'HH:mm');
      
      // Verifica se lo slot è disponibile
      let isAvailable = true;
      
      for (const booking of bookingsRows) {
        const bookingStart = parse(booking.booking_time, 'HH:mm:ss', new Date());
        const bookingEnd = addMinutes(bookingStart, booking.duration);
        const slotEnd = addMinutes(currentTime, serviceDuration);

        // Controlla se c'è sovrapposizione
        if (
          (isAfter(currentTime, bookingStart) || currentTime.getTime() === bookingStart.getTime()) &&
          isBefore(currentTime, bookingEnd)
        ) {
          isAvailable = false;
          break;
        }

        if (
          isAfter(slotEnd, bookingStart) &&
          (isBefore(slotEnd, bookingEnd) || slotEnd.getTime() === bookingEnd.getTime())
        ) {
          isAvailable = false;
          break;
        }

        if (
          (isBefore(currentTime, bookingStart) || currentTime.getTime() === bookingStart.getTime()) &&
          (isAfter(slotEnd, bookingEnd) || slotEnd.getTime() === bookingEnd.getTime())
        ) {
          isAvailable = false;
          break;
        }
      }

      // Verifica che lo slot finisca prima della chiusura
      const slotEnd = addMinutes(currentTime, serviceDuration);
      if (isAfter(slotEnd, endTime)) {
        isAvailable = false;
      }

      slots.push({
        time: timeString,
        available: isAvailable,
      });

      currentTime = addMinutes(currentTime, slotDuration);
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli slot disponibili' },
      { status: 500 }
    );
  }
}