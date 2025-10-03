import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      service_id,
      barber_id,
      booking_date,
      booking_time,
      notes,
    } = await req.json();

    // Validazione
    if (!customer_name || !customer_phone || !service_id || !barber_id || !booking_date || !booking_time) {
      return NextResponse.json(
        { error: 'Tutti i campi obbligatori devono essere compilati' },
        { status: 400 }
      );
    }

    // Verifica che lo slot sia ancora disponibile
    const [existingBookings] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM bookings 
       WHERE barber_id = ? AND booking_date = ? AND booking_time = ? AND status != 'cancelled'`,
      [barber_id, booking_date, booking_time]
    );

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Questo slot non è più disponibile' },
        { status: 409 }
      );
    }

    // Crea o trova il cliente
    let customerId;
    const [existingCustomers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM customers WHERE phone = ?',
      [customer_phone]
    );

    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
      // Aggiorna le informazioni del cliente
      await pool.query(
        'UPDATE customers SET name = ?, email = ? WHERE id = ?',
        [customer_name, customer_email || null, customerId]
      );
    } else {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
        [customer_name, customer_phone, customer_email || null]
      );
      customerId = result.insertId;
    }

    // Crea la prenotazione
    const [bookingResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO bookings (customer_id, barber_id, service_id, booking_date, booking_time, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      [customerId, barber_id, service_id, booking_date, booking_time, notes || null]
    );

    return NextResponse.json({
      success: true,
      booking_id: bookingResult.insertId,
      message: 'Prenotazione confermata con successo!',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione della prenotazione' },
      { status: 500 }
    );
  }
}