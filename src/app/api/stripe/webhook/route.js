// src/app/api/stripe/webhook/route.js
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let event;

  try {
    // Verificar que el webhook viene de Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Webhook Error: Invalid signature" },
      { status: 400 },
    );
  }

  // Manejar el evento
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;

        await dbConnect();

        // Crear la orden en la base de datos
        const orderData = {
          customerId: session.metadata.customerId,
          restaurantId: session.metadata.restaurantId,
          items: JSON.parse(session.metadata.items || "[]"),
          total: session.amount_total / 100, // Convertir de centavos a dólares
          deliveryAddress: JSON.parse(session.metadata.deliveryAddress),
          paymentMethod: "card",
          status: "pending",
          stripeSessionId: session.id,
          stripePaymentStatus: "paid",
        };

        const order = await Order.create(orderData);

        console.log("✅ Orden creada:", order._id);
        break;

      case "payment_intent.succeeded":
        console.log("💰 Pago exitoso");
        break;

      case "payment_intent.payment_failed":
        console.log("❌ Pago fallido");
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error procesando webhook:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 },
    );
  }
}