import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { ResultSetHeader } from 'mysql2';

export const PUT = withAuth(async (req: NextRequest, userId: number, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const { name, description, image_url, is_active, order_position } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Il nome è obbligatorio' },
        { status: 400 }
      );
    }

    await pool.query<ResultSetHeader>(
      'UPDATE barbers SET name = ?, description = ?, image_url = ?, is_active = ?, order_position = ? WHERE id = ?',
      [name, description || null, image_url || null, is_active, order_position, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating barber:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento del barbiere' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: NextRequest, userId: number, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;

    // Check if barber has bookings
    const [bookings] = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE barber_id = ?',
      [id]
    );

    if ((bookings as any)[0].count > 0) {
      return NextResponse.json(
        { error: 'Impossibile eliminare: il barbiere ha prenotazioni associate' },
        { status: 400 }
      );
    }

    await pool.query<ResultSetHeader>(
      'DELETE FROM barbers WHERE id = ?',
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting barber:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'eliminazione del barbiere' },
      { status: 500 }
    );
  }
});