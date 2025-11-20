// POST /api/fleet/add - Adicionar moto à frota

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, isFleetAdmin } from '@/lib/auth';
import { createFleetMotorcycle, getFleetMotorcycles } from '@/lib/db';
import { calculateFleetPlan } from '@/lib/fleet-utils';
import { extractMaintenanceRules } from '@/lib/maintenance-engine';
import { saveMaintenanceRules } from '@/lib/db';

const BASE_MOTORCYCLES = 5;

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

    // Verifica se é administrador de frota
    if (!isFleetAdmin(authUser)) {
      return NextResponse.json(
        { error: 'Apenas administradores de frota podem adicionar motos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      brand,
      model,
      year,
      plate,
      currentKm,
      renterId,
      renterName,
    } = body;

    // Validações
    if (!brand || !model || !year || !plate) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: brand, model, year, plate' },
        { status: 400 }
      );
    }

    if (currentKm < 0) {
      return NextResponse.json(
        { error: 'Quilometragem não pode ser negativa' },
        { status: 400 }
      );
    }

    // Busca motos existentes da frota
    const existingMotorcycles = await getFleetMotorcycles(authUser.userId);

    // Calcula plano
    const newTotalMotorcycles = existingMotorcycles.length + 1;
    const fleetPlan = calculateFleetPlan(newTotalMotorcycles);

    // Cria moto na frota
    const motorcycle = await createFleetMotorcycle({
      userId: authUser.userId,
      fleetOwnerId: authUser.userId,
      brand,
      model,
      year: parseInt(year),
      plate: plate.toUpperCase(),
      currentKm: currentKm || 0,
      lastMaintenanceKm: 0,
      nextMaintenanceKm: 3000, // Padrão: 3000km
      currentRenterId: renterId || undefined,
      renterName: renterName || undefined,
      status: renterId ? 'in_use' : 'available',
      maintenanceStatus: 'ok',
      totalKm: currentKm || 0,
      maintenanceCost: 0,
    });

    // Cria regras de manutenção padrão
    const defaultRules = extractMaintenanceRules('');
    await saveMaintenanceRules(motorcycle.id, defaultRules);

    return NextResponse.json({
      success: true,
      message: 'Moto adicionada à frota com sucesso',
      motorcycle,
      fleetPlan: {
        totalMotorcycles: newTotalMotorcycles,
        baseMotorcycles: BASE_MOTORCYCLES,
        extraMotorcycles: fleetPlan.extraMotorcycles,
        annualExtraCost: fleetPlan.annualExtraCost,
        isExtraCharge: newTotalMotorcycles > BASE_MOTORCYCLES,
      },
    });
  } catch (error) {
    console.error('Add fleet motorcycle error:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar moto à frota' },
      { status: 500 }
    );
  }
}
