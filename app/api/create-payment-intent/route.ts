import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'usd', metadata } = body;

    if (!amount || amount < 0.50) { // Minimum $0.50 (Stripe requirement)
      return NextResponse.json(
        { error: 'Invalid amount. Minimum charge is $0.50.' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        fileName: metadata?.fileName || 'unknown',
        duration: metadata?.duration || '0',
        fileSize: metadata?.fileSize || '0',
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error('Stripe error:', error);
    
    return NextResponse.json(
      { 
        error: 'Payment setup failed',
        details: error?.message || 'Unable to create payment intent'
      },
      { status: 500 }
    );
  }
} 