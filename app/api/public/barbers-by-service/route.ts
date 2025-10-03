import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('service_id');

    if (!serviceId) {
      return NextResponse.json({ error: 'service_id richiesto' }, { status: 400 });
    }

    // Ottieni i barbieri che possono fare questo servizio
    const [barbers] = await pool.query<RowDataPacket[]>(`
      SELECT DISTINCT b.*
      FROM barbers b
      INNER JOIN barber_services bs ON b.id = bs.barber_id
      WHERE bs.service_id = ? AND b.is_active = TRUE
      ORDER BY b.order_position ASC
    `, [serviceId]);

    return NextResponse.json(barbers);
  } catch (error: any) {
    console.error('Error fetching barbers by service:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei barbieri' },
      { status: 500 }
    );
  }
}