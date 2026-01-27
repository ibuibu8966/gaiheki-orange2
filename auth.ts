import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { AdminRole } from "@prisma/client"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  providers: [
    Credentials({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.log("[Auth] Missing credentials")
            return null
          }

          console.log("[Auth] Attempting admin login for:", credentials.username)

          const admin = await prisma.admin.findUnique({
            where: { username: credentials.username as string },
          })

          if (!admin || !admin.isActive) {
            console.log("[Auth] Admin not found or inactive")
            return null
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            admin.passwordHash
          )

          if (!isValidPassword) {
            console.log("[Auth] Invalid password")
            return null
          }

          // Update last login timestamp
          await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
          })

          console.log("[Auth] Admin login successful:", admin.username)

          return {
            id: admin.id.toString(),
            username: admin.username,
            email: admin.email,
            role: admin.role,
            userType: "admin" as const,
          }
        } catch (error) {
          console.error("[Auth] Admin authorize error:", error)
          return null
        }
      },
    }),
    Credentials({
      id: "partner-credentials",
      name: "Partner Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[Auth] Missing partner credentials")
            return null
          }

          console.log("[Auth] Attempting partner login for:", credentials.email)

          const partner = await prisma.partners.findUnique({
            where: { login_email: credentials.email as string },
          })

          if (!partner || !partner.is_active) {
            console.log("[Auth] Partner not found or inactive")
            return null
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            partner.password_hash
          )

          if (!isValidPassword) {
            console.log("[Auth] Invalid partner password")
            return null
          }

          // Update last login timestamp
          await prisma.partners.update({
            where: { id: partner.id },
            data: { last_login_at: new Date() },
          })

          console.log("[Auth] Partner login successful:", partner.username)

          return {
            id: partner.id.toString(),
            username: partner.username,
            email: partner.login_email,
            userType: "partner" as const,
          }
        } catch (error) {
          console.error("[Auth] Partner authorize error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.email = user.email
        token.role = user.role as AdminRole | undefined
        token.userType = user.userType
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.username = token.username as string
      session.user.email = token.email as string
      session.user.role = token.role as AdminRole | undefined
      session.user.userType = token.userType as "admin" | "partner"
      return session
    },
  },
  pages: {
    signIn: "/auth/admin-login",
    error: "/auth/admin-login",
  },
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
})
