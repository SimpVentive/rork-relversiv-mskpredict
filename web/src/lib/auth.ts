import { SignJWT, jwtVerify } from "jose";
import bcryptjs from "bcryptjs";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: "admin" | "hospital" | "researcher" | "clinician";
  hospital?: string;
  [key: string]: any;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export function setAuthCookie(response: Response, token: string): void {
  response.headers.set(
    "Set-Cookie",
    `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800; ${
      process.env.NODE_ENV === "production" ? "Secure;" : ""
    }`
  );
}

export function clearAuthCookie(response: Response): void {
  response.headers.set(
    "Set-Cookie",
    "auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
  );
}
