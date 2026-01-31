// src/lib/stripe.js
import Stripe from 'stripe';

// Inicializar Stripe con tu Secret Key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Función helper para formatear precios a centavos (Stripe requiere centavos)
export const formatAmountForStripe = (amount) => {
  return Math.round(amount * 100);
};

// Función helper para formatear precios de centavos a dólares
export const formatAmountFromStripe = (amount) => {
  return (amount / 100).toFixed(2);
};