import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import db from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'linkhub-super-secret-jwt-key-2026-secure-auth';

export interface AuthPayload {
  userId: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'VIEWER';
  fullName?: string | null;
}

export function signJwt(payload: AuthPayload, expiresIn: string | number = '7d'): string {
  const options: SignOptions = {
    expiresIn: expiresIn as any,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyJwt(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest) {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get('token')?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  }

  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
      avatar: true,
    },
  });

  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  return user;
}
