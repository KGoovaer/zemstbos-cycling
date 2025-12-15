import { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Wachtwoord', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email en wachtwoord zijn verplicht')
        }

        if (!prisma) {
          throw new Error('Database connection not available')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.isActive) {
          throw new Error('Ongeldige inloggegevens')
        }

        if (!user.passwordHash) {
          throw new Error('Dit account gebruikt Google login')
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValidPassword) {
          throw new Error('Ongeldige inloggegevens')
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role as 'member' | 'admin',
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as 'member' | 'admin'
        session.user.id = token.userId as string
      }
      return session
    },
    async signIn({ user }) {
      if (!prisma) {
        return false
      }

      // Check if user is active
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })

      if (dbUser && !dbUser.isActive) {
        return false
      }

      return true
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig
