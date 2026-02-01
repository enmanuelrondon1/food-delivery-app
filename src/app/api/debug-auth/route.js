// src/app/api/debug-auth/route.js
// NOTA: Eliminar este archivo después de debuggear
import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Configurado ✓' : 'NO configurado ✗',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Configurado ✓' : 'NO configurado ✗',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Configurado ✓' : 'NO configurado ✗',
    host: request.headers.get('host'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    'x-forwarded-host': request.headers.get('x-forwarded-host'),
    url: request.url,
  });
}