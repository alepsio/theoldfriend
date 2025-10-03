import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { RowDataPacket } from 'mysql2';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = `
      SELECT 
        b.*,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        br.name as barber_name,
        s.name as service_name,
        s.price as service_price,
        s.duration as service_duration
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN barbers br ON b.barber_id = br.id
      JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (date) {
      query += ' AND b.booking_date = ?';
      params.push(date);
    }

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle prenotazioni' },
      { status: 500 }
    );
  }
});