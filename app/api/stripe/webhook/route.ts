import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event;

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
    const session = event.data.object as any;
    const userId = session.metadata.userId;
    const amount = parseInt(session.metadata.amount); // ex: 5000 => 5000 FCFA

    // Conversion FCFA -> crédits (1 crédit = 1 FCFA ici)
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
