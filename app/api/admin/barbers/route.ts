import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM barbers ORDER BY name ASC'
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching barbers:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei barbieri' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { name, description, image_url } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Il nome è obbligatorio' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO barbers (name, description, image_url, is_active, order_position) VALUES (?, ?, ?, TRUE, 0)',
      [name, description || null, image_url || null]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating barber:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione del barbiere' },
      { status: 500 }
    );
  }
});