// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // Credentials Provider (login con email/password)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        // Verificar si el usuario se registró con Google
        if (user.provider === 'google' && !user.password) {
          throw new Error('Esta cuenta está vinculada con Google. Por favor inicia sesión con Google.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Contraseña incorrecta');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Si el usuario se autentica con Google
      if (account?.provider === 'google') {
        await dbConnect();

        // Buscar si el usuario ya existe
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Crear nuevo usuario si no existe
          existingUser = await User.create({
            email: user.email,
            name: user.name,
            provider: 'google',
            googleId: account.providerAccountId,
            role: 'customer',
            // No se guarda password porque es login con Google
          });
        } else if (!existingUser.googleId) {
          // Si el usuario existe pero no tiene googleId, actualizarlo
          existingUser.googleId = account.providerAccountId;
          existingUser.provider = 'google';
          await existingUser.save();
        }

        // Actualizar el objeto user con el id de MongoDB
        user.id = existingUser._id.toString();
        user.role = existingUser.role;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // CRÍTICO PARA VERCEL: Permite que NextAuth confíe en el host de Vercel
  trustHost: true,
  // Usar cookies seguras solo en producción
  useSecureCookies: process.env.NODE_ENV === 'production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };