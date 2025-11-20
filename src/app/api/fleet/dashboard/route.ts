// GET /api/fleet/dashboard - Dashboard do administrador da frota

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, isFleetAdmin } from '@/lib/auth';
import {
  getFleetMotorcycles,
  getRentersByFleetOwner,
  getAlertsByMotorcycle,
  getMaintenanceRecordsByMotorcycle,
} from '@/lib/db';
import { calculateFleetPlan } from '@/lib/fleet-utils';
import type { FleetReport } from '@/lib/types';

export async function GET(request: NextRequest) {
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
        { error: 'Apenas administradores de frota podem acessar o dashboard' },
        { status: 403 }
      );
    }

    // Busca todas as motos da frota
    const motorcycles = await getFleetMotorcycles(authUser.userId);

    // Busca todos os locatários
    const renters = await getRentersByFleetOwner(authUser.userId);

    // Calcula estatísticas
    const totalMotorcycles = motorcycles.length;
    const activeMotorcycles = motorcycles.filter((m) => m.status === 'in_use').length;
    const motorcyclesInMaintenance = motorcycles.filter(
      (m) => m.status === 'maintenance'
    ).length;
    const availableMotorcycles = motorcycles.filter(
      (m) => m.status === 'available'
    ).length;

    const totalKm = motorcycles.reduce((sum, m) => sum + m.currentKm, 0);
    const totalMaintenanceCost = motorcycles.reduce(
      (sum, m) => sum + (m.maintenanceCost || 0),
      0
    );
    const averageCostPerMotorcycle =
      totalMotorcycles > 0 ? totalMaintenanceCost / totalMotorcycles : 0;

    const motorcyclesNeedingMaintenance = motorcycles.filter(
      (m) => m.maintenanceStatus === 'urgent' || m.maintenanceStatus === 'attention'
    ).length;

    const activeRenters = renters.filter((r) => r.status === 'active').length;

    // Conta alertas urgentes
    let urgentAlerts = 0;
    for (const moto of motorcycles) {
      const alerts = await getAlertsByMotorcycle(moto.id);
      urgentAlerts += alerts.filter(
        (a) => a.priority === 'critical' || a.priority === 'high'
      ).length;
    }

    // Calcula plano da frota
    const fleetPlan = calculateFleetPlan(totalMotorcycles);

    // Monta relatório
    const report: FleetReport = {
      period: {
        start: new Date(new Date().setDate(1)), // Primeiro dia do mês
        end: new Date(),
      },
      totalMotorcycles,
      activeMotorcycles,
      motorcyclesInMaintenance,
      availableMotorcycles,
      totalKm,
      totalMaintenanceCost,
      averageCostPerMotorcycle,
      motorcyclesNeedingMaintenance,
      activeRenters,
      urgentAlerts,
    };

    // Busca detalhes de cada moto (últimas manutenções)
    const motorcyclesWithDetails = await Promise.all(
      motorcycles.map(async (moto) => {
        const maintenanceHistory = await getMaintenanceRecordsByMotorcycle(moto.id);
        const alerts = await getAlertsByMotorcycle(moto.id);

        return {
          ...moto,
          lastMaintenances: maintenanceHistory.slice(0, 3), // Últimas 3
          pendingAlerts: alerts.filter((a) => !a.isRead).length,
          urgentAlerts: alerts.filter(
            (a) => a.priority === 'critical' || a.priority === 'high'
          ).length,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        report,
        fleetPlan,
        motorcycles: motorcyclesWithDetails,
        renters,
        summary: {
          totalMotorcycles,
          activeMotorcycles,
          availableMotorcycles,
          motorcyclesInMaintenance,
          motorcyclesNeedingMaintenance,
          urgentAlerts,
          activeRenters,
          totalKm,
          averageKmPerMotorcycle:
            totalMotorcycles > 0 ? Math.round(totalKm / totalMotorcycles) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Fleet dashboard error:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dashboard da frota' },
      { status: 500 }
    );
  }
}
