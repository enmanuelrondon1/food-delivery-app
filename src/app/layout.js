// src/app/layout.js
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";

export const metadata = {
  title: "Food Delivery App",
  description: "Ordena comida de tus restaurantes favoritos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <SessionProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}