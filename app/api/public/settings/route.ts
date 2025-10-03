import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface Settings extends RowDataPacket {
  id: number;
  shop_name: string;
  shop_description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  booking_advance_days: number;
  booking_slot_duration: number;
  max_bookings_per_slot: number;
}

// Disabilita la cache per questa route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [rows] = await pool.query<Settings[]>(
      'SELECT * FROM settings WHERE id = 1'
    );

    if (rows.length === 0) {
      // Create default settings if none exist
      await pool.query(
        `INSERT INTO settings (
          shop_name, shop_description, phone, email, address, city, postal_code,
          booking_advance_days, booking_slot_duration, max_bookings_per_slot
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'The Old Friend Barbershop',
          'La tua barberia di fiducia dal 1950. Tradizione, stile e professionalità.',
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

      const [newRows] = await pool.query<Settings[]>(
        'SELECT * FROM settings WHERE id = 1'
      );
      return NextResponse.json(newRows[0], {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    return NextResponse.json(rows[0], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle impostazioni' },
      { status: 500 }
    );
  }
}