import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM services ORDER BY order_position ASC'
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei servizi' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { name, description, price, duration, order_position } = await req.json();

    if (!name || !price || !duration) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO services (name, description, price, duration, order_position) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, price, duration, order_position || 0]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione del servizio' },
      { status: 500 }
    );
  }
});