import { SessionOptions } from "iron-session";

export interface SessionData {
  partnerId: number;
  username: string;
  loginEmail: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  partnerId: 0,
  username: "",
  loginEmail: "",
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_for_security",
  cookieName: "gaiheki_partner_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
