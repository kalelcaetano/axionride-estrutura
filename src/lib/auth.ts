// AxionRide - Sistema de Autenticação JWT

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { User } from './types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'axionride-secret-key-change-in-production'
);

const TOKEN_EXPIRATION = '7d'; // 7 dias

export interface JWTPayload {
  userId: string;
  email: string;
  mode: string;
  role?: string;
  fleetOwnerId?: string;
}

/**
 * Gera token JWT para usuário
 */
export async function generateToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    mode: user.mode,
    role: user.role,
    fleetOwnerId: user.fleetOwnerId,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verifica e decodifica token JWT
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Obtém usuário autenticado do cookie
 */
export async function getAuthUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    return await verifyToken(token);
  } catch (error) {
    console.error('Get auth user failed:', error);
    return null;
  }
}

/**
 * Define cookie de autenticação
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  });
}

/**
 * Remove cookie de autenticação
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

/**
 * Hash de senha (simulado - em produção use bcrypt)
 */
export function hashPassword(password: string): string {
  // Em produção, use bcrypt ou argon2
  // Aqui é apenas simulação
  return Buffer.from(password).toString('base64');
}

/**
 * Verifica senha (simulado - em produção use bcrypt)
 */
export function verifyPassword(password: string, hash: string): boolean {
  // Em produção, use bcrypt.compare
  return Buffer.from(password).toString('base64') === hash;
}

/**
 * Verifica se usuário é administrador de frota
 */
export function isFleetAdmin(user: JWTPayload): boolean {
  return user.mode === 'fleet' && user.role === 'admin';
}

/**
 * Verifica se usuário é locatário
 */
export function isRenter(user: JWTPayload): boolean {
  return user.mode === 'fleet' && user.role === 'renter';
}

/**
 * Verifica permissões de acesso a moto
 */
export function canAccessMotorcycle(
  user: JWTPayload,
  motorcycleOwnerId: string,
  motorcycleRenterId?: string
): boolean {
  // Admin de frota pode acessar todas as motos da frota
  if (isFleetAdmin(user) && user.userId === motorcycleOwnerId) {
    return true;
  }

  // Locatário pode acessar apenas a moto atribuída
  if (isRenter(user) && motorcycleRenterId === user.userId) {
    return true;
  }

  // Usuário comum pode acessar apenas suas próprias motos
  if (user.mode !== 'fleet' && user.userId === motorcycleOwnerId) {
    return true;
  }

  return false;
}
