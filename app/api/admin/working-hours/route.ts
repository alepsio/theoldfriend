import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        wh.*,
        b.name as barber_name
      FROM working_hours wh
      LEFT JOIN barbers b ON wh.barber_id = b.id
      ORDER BY wh.barber_id, wh.day_of_week
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching working hours:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli orari' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { barber_id, day_of_week, start_time, end_time } = await req.json();

    if (day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO working_hours (barber_id, day_of_week, start_time, end_time, is_active) VALUES (?, ?, ?, ?, TRUE)',
      [barber_id || null, day_of_week, start_time, end_time]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating working hour:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione dell\'orario' },
      { status: 500 }
    );
  }
});