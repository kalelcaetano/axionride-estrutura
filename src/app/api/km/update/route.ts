// POST /api/km/update - Atualizar quilometragem

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, canAccessMotorcycle } from '@/lib/auth';
import {
  getMotorcycleById,
  updateMotorcycle,
  createKmUpdate,
  getMaintenanceRecordsByMotorcycle,
} from '@/lib/db';
import { getMaintenanceRules } from '@/lib/db';
import { recalculateMaintenanceOnKmUpdate } from '@/lib/maintenance-engine';
import { notifyKmUpdate, notifyFleetSync } from '@/lib/notification-service';
import type { FleetMotorcycle } from '@/lib/types';

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
    const { motorcycleId, newKm, updateType = 'manual' } = body;

    // Validações
    if (!motorcycleId || !newKm) {
      return NextResponse.json(
        { error: 'motorcycleId e newKm são obrigatórios' },
        { status: 400 }
      );
    }

    if (newKm < 0) {
      return NextResponse.json(
        { error: 'Quilometragem não pode ser negativa' },
        { status: 400 }
      );
    }

    // Busca moto
    const motorcycle = await getMotorcycleById(motorcycleId);
    if (!motorcycle) {
      return NextResponse.json(
        { error: 'Moto não encontrada' },
        { status: 404 }
      );
    }

    // Verifica permissão de acesso
    const hasAccess = canAccessMotorcycle(
      authUser,
      motorcycle.userId,
      'currentRenterId' in motorcycle ? motorcycle.currentRenterId : undefined
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Sem permissão para atualizar esta moto' },
        { status: 403 }
      );
    }

    // Valida que nova km é maior que atual
    if (newKm < motorcycle.currentKm) {
      return NextResponse.json(
        { error: 'Nova quilometragem não pode ser menor que a atual' },
        { status: 400 }
      );
    }

    const oldKm = motorcycle.currentKm;

    // Atualiza quilometragem
    await updateMotorcycle(motorcycleId, {
      currentKm: newKm,
    });

    // Registra atualização no histórico
    await createKmUpdate({
      motorcycleId,
      userId: authUser.userId,
      oldKm,
      newKm,
      updateType,
      kmDiff: newKm - oldKm,
    });

    // Recalcula manutenções
    const maintenanceHistory = await getMaintenanceRecordsByMotorcycle(motorcycleId);
    const rulesData = await getMaintenanceRules(motorcycleId);
    
    let calculations = [];
    let alerts = [];

    if (rulesData && rulesData.rules) {
      const result = await recalculateMaintenanceOnKmUpdate(
        { ...motorcycle, currentKm: newKm },
        maintenanceHistory,
        rulesData.rules
      );
      calculations = result.calculations;
      alerts = result.alerts;
    }

    // Notificações
    // Se for modo frota, notifica admin e locatário
    if ('fleetOwnerId' in motorcycle) {
      const fleetMoto = motorcycle as FleetMotorcycle;
      
      // Notifica o outro usuário (se admin atualizou, notifica locatário e vice-versa)
      if (authUser.userId !== fleetMoto.fleetOwnerId && fleetMoto.fleetOwnerId) {
        await notifyKmUpdate(
          fleetMoto.fleetOwnerId,
          motorcycleId,
          oldKm,
          newKm,
          authUser.userId
        );
      }

      if (fleetMoto.currentRenterId && authUser.userId !== fleetMoto.currentRenterId) {
        await notifyKmUpdate(
          fleetMoto.currentRenterId,
          motorcycleId,
          oldKm,
          newKm,
          authUser.userId
        );
      }

      // Notifica sincronização da frota
      await notifyFleetSync(
        fleetMoto.fleetOwnerId,
        fleetMoto.currentRenterId,
        motorcycleId,
        'km_update',
        `Quilometragem atualizada de ${oldKm}km para ${newKm}km`
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quilometragem atualizada com sucesso',
      data: {
        motorcycleId,
        oldKm,
        newKm,
        kmDiff: newKm - oldKm,
        calculations,
        newAlerts: alerts.length,
      },
    });
  } catch (error) {
    console.error('KM update error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar quilometragem' },
      { status: 500 }
    );
  }
}
