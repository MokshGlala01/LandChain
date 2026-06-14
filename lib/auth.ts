import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { comparePassword } from '@/lib/password'
import { z } from 'zod'

// Temporary — add at top of file, remove after fix confirmed
console.log('🔍 GOOGLE_CLIENT_ID loaded:', !!process.env.GOOGLE_CLIENT_ID)
console.log('🔍 GOOGLE_CLIENT_ID value starts with:', process.env.GOOGLE_CLIENT_ID?.slice(0, 20))
console.log('🔍 NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login'
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        isMockGoogle: { label: 'Mock Google', type: 'text' }
      },
      async authorize(credentials) {
        if (credentials?.isMockGoogle === 'true') {
          const email = (credentials?.email as string) || 'mokshgala.ijs009@gmail.com'
          
          let user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user) {
            // Auto-create user on first Mock Google sign-in
            user = await prisma.user.create({
              data: {
                email,
                name: email.split('@')[0].replace('.', ' '),
                image: 'https://lh3.googleusercontent.com/a/default-user',
                role: 'CITIZEN',
                status: 'ACTIVE',
                emailVerified: new Date()
              }
            })
          }

          if (user.status === 'SUSPENDED') return null

          return { id: user.id, email: user.email, name: user.name, role: user.role, image: user.image }
        }

        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) return null

        const valid = await comparePassword(
          credentials.password as string,
          user.password
        )
        if (!valid) return null
        if (user.status === 'SUSPENDED') return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          if (!existing) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name ?? '',
                image: user.image ?? '',
                role: 'CITIZEN',
                status: 'ACTIVE',
                emailVerified: new Date()
              }
            })
          }
          if (existing?.status === 'SUSPENDED') return false
          return true
        } catch (error) {
          console.error('Google signIn error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! }
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.status = dbUser.status
        }
      }
      if (trigger === 'update' && session?.role) {
        token.role = session.role
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
    },
    async redirect({ url, baseUrl }) {
      // After Google login → redirect to role-based dashboard
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return `${baseUrl}/auth/redirect`
    }
  }
})

export async function getSessionUser(req?: Request) {
  try {
    const session = await auth();
    if (session?.user) {
      return session.user;
    }
  } catch (err) {
    console.warn("NextAuth session check failed.");
  }
  return null;
}
