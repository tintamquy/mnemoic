export const runtime = "edge";

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

// Credit packages — solve problem first, charge tiny fee
const PACKAGES = {
  starter: { credits: 10, price: 99, label: "Starter" },    // $0.99
  basic: { credits: 35, price: 299, label: "Basic" },        // $2.99
  pro: { credits: 100, price: 599, label: "Pro" },           // $5.99
} as const;

type PackageKey = keyof typeof PACKAGES;

export async function POST(req: NextRequest) {
  // Lazy-init so build succeeds without env vars present
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });

  try {
    const { packageId } = await req.json() as { packageId: PackageKey };
    const pkg = PACKAGES[packageId];

    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `MnemoAI — ${pkg.label} Pack`,
              description: `${pkg.credits} AI mnemonic generations`,
              images: [],
            },
            unit_amount: pkg.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        packageId,
        credits: pkg.credits.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=true&credits=${pkg.credits}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?cancelled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
