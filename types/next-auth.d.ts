import "next-auth"
import { AdminRole } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    username: string
    email: string
    role?: AdminRole
    userType: "admin" | "partner"
  }

  interface Session {
    user: {
      id: string
      username: string
      email: string
      role?: AdminRole
      userType: "admin" | "partner"
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    email: string
    role?: AdminRole
    userType: "admin" | "partner"
  }
}
