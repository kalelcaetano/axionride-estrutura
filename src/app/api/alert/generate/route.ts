// POST /api/alert/generate - Gerar alertas automáticos

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, canAccessMotorcycle } from '@/lib/auth';
import {
  getMotorcycleById,
  getMaintenanceRecordsByMotorcycle,
  getMaintenanceRules,
  createAlert,
} from '@/lib/db';
import {
  calculateMaintenanceSchedule,
  generateMaintenanceAlerts,
  extractMaintenanceRules,
} from '@/lib/maintenance-engine';
import { notifyMaintenanceAlert } from '@/lib/notification-service';

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
    const { motorcycleId } = body;

    // Validações
    if (!motorcycleId) {
      return NextResponse.json(
        { error: 'motorcycleId é obrigatório' },
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

    // Verifica permissão
    const hasAccess = canAccessMotorcycle(
      authUser,
      motorcycle.userId,
      'currentRenterId' in motorcycle ? motorcycle.currentRenterId : undefined
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar esta moto' },
        { status: 403 }
      );
    }

    // Busca regras de manutenção
    let rulesData = await getMaintenanceRules(motorcycleId);
    
    // Se não tem regras, cria regras padrão
    if (!rulesData) {
      const defaultRules = extractMaintenanceRules('');
      rulesData = { rules: defaultRules };
    }

    // Busca histórico de manutenção
    const maintenanceHistory = await getMaintenanceRecordsByMotorcycle(motorcycleId);

    // Calcula próximas manutenções
    const calculations = calculateMaintenanceSchedule(
      motorcycle,
      maintenanceHistory,
      rulesData.rules
    );

    // Gera alertas
    const alerts = generateMaintenanceAlerts(motorcycleId, calculations);

    // Salva alertas no banco
    const savedAlerts = [];
    for (const alert of alerts) {
      const saved = await createAlert(alert);
      savedAlerts.push(saved);

      // Envia notificação para alertas urgentes ou críticos
      if (alert.priority === 'high' || alert.priority === 'critical') {
        await notifyMaintenanceAlert(
          authUser.userId,
          motorcycleId,
          alert.title,
          alert.message
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `${savedAlerts.length} alertas gerados com sucesso`,
      data: {
        calculations,
        alerts: savedAlerts,
        summary: {
          total: savedAlerts.length,
          critical: savedAlerts.filter((a) => a.priority === 'critical').length,
          high: savedAlerts.filter((a) => a.priority === 'high').length,
          medium: savedAlerts.filter((a) => a.priority === 'medium').length,
          low: savedAlerts.filter((a) => a.priority === 'low').length,
        },
      },
    });
  } catch (error) {
    console.error('Generate alerts error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar alertas' },
      { status: 500 }
    );
  }
}
