/**
 * Edge-compatible auth config for middleware.
 * Uses ONLY the JWT session strategy — no Prisma, no Node.js-only APIs.
 * Next.js middleware runs in the Edge Runtime, so this file must stay clean.
 */
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { auth } = NextAuth({
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login'
  },
  providers: [
    // Minimal provider list — just enough for NextAuth to parse JWT tokens.
    // The actual Google OAuth flow is handled by lib/auth.ts (server-side).
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'placeholder'
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.status = (user as any).status
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    }
  }
})
