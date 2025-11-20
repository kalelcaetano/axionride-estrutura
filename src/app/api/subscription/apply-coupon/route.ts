// POST /api/subscription/apply-coupon - Aplicar cupom TAVARES160

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSubscriptionByUserId, updateSubscription } from '@/lib/db';

const COUPON_CODE = 'TAVARES160';
const COUPON_DISCOUNT = 10; // R$ 10 de desconto

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
    const { couponCode } = body;

    // Valida cupom
    if (!couponCode || couponCode.toUpperCase() !== COUPON_CODE) {
      return NextResponse.json(
        { error: 'Cupom inválido' },
        { status: 400 }
      );
    }

    // Busca assinatura
    const subscription = await getSubscriptionByUserId(authUser.userId);
    if (!subscription) {
      return NextResponse.json(
        { error: 'Você precisa ter uma assinatura ativa para aplicar o cupom' },
        { status: 400 }
      );
    }

    // Verifica se cupom já foi aplicado
    if (subscription.couponApplied) {
      return NextResponse.json(
        { error: 'Cupom já foi aplicado anteriormente' },
        { status: 400 }
      );
    }

    // Verifica se é plano anual (cupom não se aplica)
    if (subscription.type === 'yearly') {
      return NextResponse.json(
        { error: 'Cupom válido apenas para planos mensais' },
        { status: 400 }
      );
    }

    // Aplica desconto
    const originalPrice = subscription.price;
    const newPrice = Math.max(0, originalPrice - COUPON_DISCOUNT);

    // Atualiza assinatura
    const updatedSubscription = await updateSubscription(authUser.userId, {
      price: newPrice,
      originalPrice,
      couponApplied: true,
      couponCode: COUPON_CODE,
      discount: COUPON_DISCOUNT,
    });

    return NextResponse.json({
      success: true,
      message: `Cupom ${COUPON_CODE} aplicado com sucesso! Desconto de R$ ${COUPON_DISCOUNT}`,
      subscription: updatedSubscription,
      discount: COUPON_DISCOUNT,
      originalPrice,
      newPrice,
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    return NextResponse.json(
      { error: 'Erro ao aplicar cupom' },
      { status: 500 }
    );
  }
}
