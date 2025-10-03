import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM services WHERE is_active = TRUE ORDER BY order_position ASC'
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei servizi' },
      { status: 500 }
    );
  }
}