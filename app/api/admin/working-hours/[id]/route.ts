import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { ResultSetHeader } from 'mysql2';

export const PUT = withAuth(async (req: NextRequest, userId: number, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const { barber_id, day_of_week, start_time, end_time, is_active } = await req.json();

    await pool.query<ResultSetHeader>(
      'UPDATE working_hours SET barber_id = ?, day_of_week = ?, start_time = ?, end_time = ?, is_active = ? WHERE id = ?',
      [barber_id || null, day_of_week, start_time, end_time, is_active, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating working hour:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento dell\'orario' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: NextRequest, userId: number, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;

    await pool.query<ResultSetHeader>(
      'DELETE FROM working_hours WHERE id = ?',
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting working hour:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'eliminazione dell\'orario' },
      { status: 500 }
    );
  }
});