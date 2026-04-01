import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        name: { label: 'Name', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) return null

        const hotelId = parseInt(process.env.NEXT_PUBLIC_DEFAULT_HOTEL_ID ?? '1')

        const user = await prisma.user.findFirst({
          where: { hotelId, name: credentials.name as string },
        })

        if (!user) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null

        return { id: String(user.id), name: user.name, hotelId: String(user.hotelId) }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.hotelId = (user as { hotelId?: string }).hotelId
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as { hotelId?: string }).hotelId = token.hotelId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
