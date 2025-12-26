import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Credits hinzufügen
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}

