import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { RowDataPacket } from 'mysql2';

// GET - Ottieni i servizi di un barbiere
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barber_id');

    if (!barberId) {
      return NextResponse.json({ error: 'barber_id richiesto' }, { status: 400 });
    }

    // Ottieni tutti i servizi con flag se sono assegnati al barbiere
    const [services] = await pool.query<RowDataPacket[]>(`
      SELECT 
        s.*,
        CASE WHEN bs.id IS NOT NULL THEN TRUE ELSE FALSE END as is_assigned
      FROM services s
      LEFT JOIN barber_services bs ON s.id = bs.service_id AND bs.barber_id = ?
      WHERE s.is_active = TRUE
      ORDER BY s.order_position ASC
    `, [barberId]);

    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Error fetching barber services:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei servizi' },
      { status: 500 }
    );
  }
});

// POST - Aggiorna i servizi di un barbiere
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { barber_id, service_ids } = await request.json();

    if (!barber_id || !Array.isArray(service_ids)) {
      return NextResponse.json(
        { error: 'barber_id e service_ids (array) richiesti' },
        { status: 400 }
      );
    }

    // Rimuovi tutte le associazioni esistenti
    await pool.query('DELETE FROM barber_services WHERE barber_id = ?', [barber_id]);

    // Aggiungi le nuove associazioni
    if (service_ids.length > 0) {
      const values = service_ids.map(serviceId => [barber_id, serviceId]);
      const placeholders = values.map(() => '(?, ?)').join(', ');
      const flatValues = values.flat();

      await pool.query(
        `INSERT INTO barber_services (barber_id, service_id) VALUES ${placeholders}`,
        flatValues
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Servizi aggiornati con successo',
    });
  } catch (error: any) {
    console.error('Error updating barber services:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dei servizi' },
      { status: 500 }
    );
  }
});