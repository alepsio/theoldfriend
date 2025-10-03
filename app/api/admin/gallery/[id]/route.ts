import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { ResultSetHeader } from 'mysql2';

export const PUT = withAuth(async (req: NextRequest, userId: number, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const { image_url, title, description, is_active, order_position } = await req.json();

    await pool.query<ResultSetHeader>(
      'UPDATE gallery SET image_url = ?, title = ?, description = ?, is_active = ?, order_position = ? WHERE id = ?',
      [image_url, title, description || null, is_active, order_position, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento dell\'immagine' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: NextRequest, userId: number, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;

    await pool.query<ResultSetHeader>(
      'DELETE FROM gallery WHERE id = ?',
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'eliminazione dell\'immagine' },
      { status: 500 }
    );
  }
});