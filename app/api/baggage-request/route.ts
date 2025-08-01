import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message, quantity } = body;

    if (!name || !email || !phone || !message || !quantity) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    await prisma.baggageRequest.create({
      data: {
        name,
        email,
        phone,
        message,
        quantity: parseInt(quantity),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[BAGGAGE_REQUEST]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
