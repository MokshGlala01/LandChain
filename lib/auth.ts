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
  pages: {
    signIn: '/login',
    newUser: '/register'
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(8)
        }).safeParse(credentials)

        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email }
        })

        if (!user || !user.password) return null

        const passwordMatch = await comparePassword(parsed.data.password, user.password)
        if (!passwordMatch) return null

        if (user.status === 'SUSPENDED') return null

        return { id: user.id, email: user.email, name: user.name, role: user.role, image: user.image }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
        token.userId = dbUser?.id
        token.role = dbUser?.role
        token.status = dbUser?.status
      }
      if (trigger === 'update' && session?.role) {
        token.role = session.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existing = await prisma.user.findUnique({ where: { email: user.email! } })
        if (!existing) {
          // Auto-create user on first Google sign-in
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
      }
      return true
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
