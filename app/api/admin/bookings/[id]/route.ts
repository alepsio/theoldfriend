import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { withAuth } from '@/lib/middleware';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// --- LOGICA PER NOTIFICHE WHATSAPP ---

interface BookingDetailsForWhatsApp {
  client_name: string;
  client_phone: string;
  service_name: string;
  date: string;
  time: string;
  shop_name: string;
  shop_address: string;
}

async function sendWhatsAppNotification(details: BookingDetailsForWhatsApp) {
  /*
   * Per inviare messaggi WhatsApp, devi usare un servizio come Twilio.
   * 1. Crea un account su Twilio.
   * 2. Ottieni il tuo 'Account SID', 'Auth Token' e un numero di telefono WhatsApp.
   * 3. Salva queste credenziali nel tuo file .env.local (crealo se non esiste):
   *    TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   *    TWILIO_AUTH_TOKEN=your_auth_token
   *    TWILIO_WHATSAPP_FROM=whatsapp:+14155238886 (il tuo numero Twilio)
   * 4. Installa la libreria di Twilio: npm install twilio
   */
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  // Se le credenziali non sono configurate, simula l'invio e logga in console.
  if (!accountSid || !authToken || !fromNumber) {
    console.log('--- NOTIFICA WHATSAPP (SIMULATA) ---');
    console.log('Credenziali Twilio non trovate. Configura .env.local per inviare messaggi reali.');
    return;
  }

  // Assicura che il numero del cliente sia in formato E.164 (es. whatsapp:+393331234567)
  const toNumbere164 = `whatsapp:${details.client_phone.startsWith('+') ? details.client_phone : '+' + details.client_phone}`;

  const messageBody =
`Ciao ${details.client_name}!
La tua prenotazione presso ${details.shop_name} è stata confermata!

Ecco i dettagli:
- Servizio: ${details.service_name}
- Data: ${new Date(details.date).toLocaleDateString('it-IT')}
- Ora: ${details.time.substring(0, 5)}

Ti aspettiamo in ${details.shop_address}.
A presto!`;

  try {
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: toNumbere164
    });

    console.log(`Messaggio WhatsApp inviato con successo a ${toNumbere164}`);

  } catch (error) {
    console.error("Errore durante l'invio della notifica WhatsApp:", error);
    // Non bloccare la risposta API principale se la notifica fallisce.
  }
}


export const PATCH = withAuth(async (req: NextRequest, userId: number, context?: any) => {
  try {
    const { status } = await req.json();
    const params = context?.params || {};
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'ID prenotazione mancante' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status è obbligatorio' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status non valido' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, bookingId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Prenotazione non trovata' },
        { status: 404 }
      );
    }

    // Se la prenotazione è stata confermata, invia la notifica WhatsApp.
    if (status === 'confirmed') {
      try {
        const [bookingDetailsRows] = await pool.query<RowDataPacket[]>(
          `SELECT b.client_name, b.client_phone, b.date, b.time, s.name as service_name
           FROM bookings b
           JOIN services s ON b.service_id = s.id
           WHERE b.id = ?`,
          [bookingId]
        );

        const [settingsRows] = await pool.query<RowDataPacket[]>(
          `SELECT name, value FROM settings WHERE name IN ('shop_name', 'shop_address')`
        );

        if (bookingDetailsRows.length > 0) {
          const booking = bookingDetailsRows[0];
          const settings = settingsRows.reduce((acc, setting) => {
            acc[setting.name] = setting.value;
            return acc;
          }, {} as Record<string, string>);

          await sendWhatsAppNotification({
            client_name: booking.client_name,
            client_phone: booking.client_phone,
            service_name: booking.service_name,
            date: booking.date,
            time: booking.time,
            shop_name: settings.shop_name || 'Il Tuo Salone',
            shop_address: settings.shop_address || 'Il Tuo Indirizzo',
          });
        }
      } catch (notificationError) {
        console.error("Errore durante la preparazione o l'invio della notifica:", notificationError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento della prenotazione' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: NextRequest, userId: number, context?: any) => {
  try {
    const params = context?.params || {};
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'ID prenotazione mancante' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Prenotazione non trovata' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'eliminazione della prenotazione' },
      { status: 500 }
    );
  }
});