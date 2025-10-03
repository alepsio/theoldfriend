import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export function withAuth(handler: (req: NextRequest, userId: number, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    try {
      const authHeader = req.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      if (!payload) {
        return NextResponse.json({ error: 'Token non valido' }, { status: 401 });
      }

      return handler(req, payload.userId, context);
    } catch (error) {
      return NextResponse.json({ error: 'Errore di autenticazione' }, { status: 401 });
    }
  };
}