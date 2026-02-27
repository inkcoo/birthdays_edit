import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'birthday-manager-secret-key-change-in-production');

export interface SessionPayload {
  userId: string;
  expiresAt: number;
}

/**
 * 创建会话 Token
 */
export async function createSession(userId: string): Promise<string> {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 天有效期
  
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(JWT_SECRET);
}

/**
 * 验证会话 Token
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * 检查会话是否过期
 */
export function isSessionExpired(payload: SessionPayload): boolean {
  return Date.now() > payload.expiresAt;
}
