// src/app/api/stripe/create-checkout-session/route.js
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderData } = body;

    // Validar datos
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: "Datos de orden inválidos" },
        { status: 400 },
      );
    }

    // Crear line items para Stripe
    const lineItems = orderData.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: `Cantidad: ${item.quantity}`,
        },
        unit_amount: Math.round(item.price * 100), // Convertir a centavos
      },
      quantity: item.quantity,
    }));

    // Crear sesión de checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
      metadata: {
        // Guardar información de la orden en metadata
        customerId: orderData.customerId,
        restaurantId: orderData.restaurantId,
        deliveryAddress: JSON.stringify(orderData.deliveryAddress),
        paymentMethod: "card",
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creando sesión de Stripe:", error);
    return NextResponse.json(
      { error: "Error al procesar el pago" },
      { status: 500 },
    );
  }
}
