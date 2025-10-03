import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { ResultSetHeader } from 'mysql2';

export const PUT = withAuth(async (req: NextRequest, userId: number, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const { name, description, price, duration, is_active, order_position } = await req.json();

    await pool.query<ResultSetHeader>(
      'UPDATE services SET name = ?, description = ?, price = ?, duration = ?, is_active = ?, order_position = ? WHERE id = ?',
      [name, description || null, price, duration, is_active, order_position, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento del servizio' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: NextRequest, userId: number, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;

    await pool.query<ResultSetHeader>(
      'DELETE FROM services WHERE id = ?',
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'eliminazione del servizio' },
      { status: 500 }
    );
  }
});