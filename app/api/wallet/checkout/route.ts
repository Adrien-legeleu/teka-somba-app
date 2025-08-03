import { stripe } from '@/lib/stripe';
import { getUserIdFromRequest } from '@/lib/authUser';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { amount } = await req.json();
  const userId = await getUserIdFromRequest();
  if (!userId)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], // ancienne façon
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'xof',
          product_data: {
            name: `Crédits TekaSomba (${amount} USD)`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      amount,
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/wallet?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
