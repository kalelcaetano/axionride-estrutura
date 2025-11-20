// POST /api/subscription/update - Atualizar assinatura

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createSubscription, updateSubscription, getSubscriptionByUserId } from '@/lib/db';

// Planos disponíveis
const PLANS = {
  motoboy: { name: 'Motoboy', price: 30, type: 'monthly' },
  viajante: { name: 'Viajante', price: 30, type: 'monthly' },
  casa_trabalho: { name: 'Casa-Trabalho', price: 20, type: 'monthly' },
  premium: { name: 'Premium', price: 40, type: 'monthly' },
  premium_anual: { name: 'Premium Anual', price: 240, type: 'yearly' },
};

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planType } = body;

    // Valida plano
    if (!planType || !PLANS[planType as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Plano inválido. Opções: motoboy, viajante, casa_trabalho, premium, premium_anual' },
        { status: 400 }
      );
    }

    const plan = PLANS[planType as keyof typeof PLANS];

    // Calcula data de renovação
    const renewalDate = new Date();
    if (plan.type === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    // Verifica se já tem assinatura
    const existingSubscription = await getSubscriptionByUserId(authUser.userId);

    const subscriptionData = {
      planType,
      planName: plan.name,
      price: plan.price,
      type: plan.type,
      renewalDate,
      couponApplied: false,
      status: 'active',
    };

    let subscription;
    if (existingSubscription) {
      // Atualiza assinatura existente
      subscription = await updateSubscription(authUser.userId, subscriptionData);
    } else {
      // Cria nova assinatura
      subscription = await createSubscription(authUser.userId, subscriptionData);
    }

    return NextResponse.json({
      success: true,
      message: 'Assinatura atualizada com sucesso',
      subscription,
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar assinatura' },
      { status: 500 }
    );
  }
}
