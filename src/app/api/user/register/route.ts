// POST /api/user/register - Cadastro de usuário

import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { generateToken, setAuthCookie, hashPassword } from '@/lib/auth';
import type { UserMode, UserRole } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, mode, role, fleetOwnerId } = body;

    // Validações
    if (!name || !email || !password || !mode) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, email, password, mode' },
        { status: 400 }
      );
    }

    // Valida modo
    const validModes: UserMode[] = ['motoboy', 'personal', 'fleet'];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: 'Modo inválido. Use: motoboy, personal ou fleet' },
        { status: 400 }
      );
    }

    // Valida email único
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Valida role para modo frota
    if (mode === 'fleet') {
      const validRoles: UserRole[] = ['admin', 'renter'];
      if (!role || !validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Para modo frota, role é obrigatório (admin ou renter)' },
          { status: 400 }
        );
      }

      // Se é locatário, precisa do fleetOwnerId
      if (role === 'renter' && !fleetOwnerId) {
        return NextResponse.json(
          { error: 'Locatário precisa de fleetOwnerId' },
          { status: 400 }
        );
      }
    }

    // Hash da senha
    const hashedPassword = hashPassword(password);

    // Cria usuário
    const user = await createUser({
      name,
      email,
      phone: phone || '',
      mode,
      role: mode === 'fleet' ? role : undefined,
      fleetOwnerId: mode === 'fleet' && role === 'renter' ? fleetOwnerId : undefined,
      password: hashedPassword,
    });

    // Gera token JWT
    const token = await generateToken(user);

    // Define cookie
    await setAuthCookie(token);

    // Remove senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: 'Usuário cadastrado com sucesso',
        user: userWithoutPassword,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erro ao cadastrar usuário' },
      { status: 500 }
    );
  }
}
