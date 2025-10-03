import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM gallery ORDER BY order_position ASC'
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle immagini' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { image_url, title, description, order_position } = await req.json();

    if (!image_url || !title) {
      return NextResponse.json(
        { error: 'URL immagine e titolo sono obbligatori' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO gallery (image_url, title, description, order_position) VALUES (?, ?, ?, ?)',
      [image_url, title, description || null, order_position || 0]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiunta dell\'immagine' },
      { status: 500 }
    );
  }
});