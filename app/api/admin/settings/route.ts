import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM settings LIMIT 1'
    );

    if (rows.length === 0) {
      // Create default settings if none exist
      await pool.query<ResultSetHeader>(
        `INSERT INTO settings (
          shop_name, shop_description, phone, email, address, city, postal_code,
          booking_advance_days, booking_slot_duration, max_bookings_per_slot
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'The Old Friend Barbershop',
          'Il tuo barbiere di fiducia',
          '+39 123 456 7890',
          'info@theoldfriend.it',
          'Via Roma 123',
          'Milano',
          '20100',
          30,
          30,
          3
        ]
      );

      const [newRows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM settings LIMIT 1'
      );
      return NextResponse.json(newRows[0]);
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle impostazioni' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (req: NextRequest) => {
  try {
    const {
      shop_name,
      shop_description,
      phone,
      email,
      address,
      city,
      postal_code,
      booking_advance_days,
      booking_slot_duration,
      max_bookings_per_slot,
    } = await req.json();

    // Get the ID of the first (and only) settings row
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM settings LIMIT 1'
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Impostazioni non trovate' },
        { status: 404 }
      );
    }

    const settingsId = rows[0].id;

    await pool.query<ResultSetHeader>(
      `UPDATE settings SET 
        shop_name = ?, 
        shop_description = ?, 
        phone = ?, 
        email = ?, 
        address = ?, 
        city = ?, 
        postal_code = ?,
        booking_advance_days = ?,
        booking_slot_duration = ?,
        max_bookings_per_slot = ?
      WHERE id = ?`,
      [
        shop_name,
        shop_description,
        phone,
        email,
        address,
        city,
        postal_code,
        booking_advance_days,
        booking_slot_duration,
        max_bookings_per_slot,
        settingsId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento delle impostazioni' },
      { status: 500 }
    );
  }
});