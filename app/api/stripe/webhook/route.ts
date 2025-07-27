import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // On vérifie que les métadonnées existent
    const userId = session.metadata?.userId;
    const amountStr = session.metadata?.amount;

    if (!userId || !amountStr) {
      return NextResponse.json(
        { error: 'Metadata userId ou amount manquant.' },
        { status: 400 }
      );
    }

    const amount = parseInt(amountStr, 10);
    if (isNaN(amount)) {
      return NextResponse.json({ error: 'Amount invalide.' }, { status: 400 });
    }

    // Conversion FCFA -> crédits (1 crédit = 1 FCFA)
    const credits = amount;

    await prisma.user.update({
      where: { id: userId },
      data: {
        credit: { increment: credits },
        walletTransaction: {
          create: {
            amount: credits,
            type: 'RECHARGE',
            metadata: `Stripe checkout session ${session.id}`,
          },
        },
      },
    });
  }

  return new NextResponse('OK', { status: 200 });
}
