// AxionRide - Engine de Cálculo de Manutenção

import type { MaintenanceRecord, Alert, Motorcycle, FleetMotorcycle } from './types';
import { DEFAULT_MAINTENANCE_INTERVALS } from './constants';
import { generateId } from './fleet-utils';

export interface MaintenanceRule {
  type: string;
  name: string;
  intervalKm: number;
  intervalDays?: number;
  lastKm?: number;
  lastDate?: Date;
}

export interface MaintenanceCalculation {
  type: string;
  name: string;
  nextDueKm: number;
  kmRemaining: number;
  daysRemaining?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'ok' | 'attention' | 'urgent' | 'overdue';
}

/**
 * Extrai regras de manutenção do manual (simulado)
 * Em produção, usar OCR ou parsing de PDF
 */
export function extractMaintenanceRules(manualText: string): MaintenanceRule[] {
  // Regras padrão baseadas em manuais comuns
  const defaultRules: MaintenanceRule[] = [
    {
      type: 'oil_change',
      name: 'Troca de Óleo',
      intervalKm: 3000,
      intervalDays: 180, // 6 meses
    },
    {
      type: 'oil_filter',
      name: 'Filtro de Óleo',
      intervalKm: 3000,
      intervalDays: 180,
    },
    {
      type: 'air_filter',
      name: 'Filtro de Ar',
      intervalKm: 6000,
      intervalDays: 365, // 1 ano
    },
    {
      type: 'chain_kit',
      name: 'Kit Relação',
      intervalKm: 15000,
    },
    {
      type: 'tire_change',
      name: 'Troca de Pneus',
      intervalKm: 20000,
    },
    {
      type: 'brake_fluid',
      name: 'Fluido de Freio',
      intervalKm: 12000,
      intervalDays: 730, // 2 anos
    },
    {
      type: 'chain_maintenance',
      name: 'Manutenção de Corrente',
      intervalKm: 1000,
      intervalDays: 30,
    },
    {
      type: 'general_revision',
      name: 'Revisão Geral',
      intervalKm: 5000,
      intervalDays: 365,
    },
  ];

  // Em produção, fazer parsing do texto do manual
  // Por enquanto, retorna regras padrão
  return defaultRules;
}

/**
 * Calcula próximas manutenções baseado em km atual e histórico
 */
export function calculateMaintenanceSchedule(
  motorcycle: Motorcycle | FleetMotorcycle,
  maintenanceHistory: MaintenanceRecord[],
  rules: MaintenanceRule[]
): MaintenanceCalculation[] {
  const currentKm = motorcycle.currentKm;
  const calculations: MaintenanceCalculation[] = [];

  for (const rule of rules) {
    // Encontra última manutenção deste tipo
    const lastMaintenance = maintenanceHistory
      .filter((record) => record.type === rule.type)
      .sort((a, b) => b.km - a.km)[0];

    const lastKm = lastMaintenance?.km || 0;
    const lastDate = lastMaintenance?.date;

    // Calcula próxima manutenção por km
    const nextDueKm = lastKm + rule.intervalKm;
    const kmRemaining = nextDueKm - currentKm;

    // Calcula próxima manutenção por tempo (se aplicável)
    let daysRemaining: number | undefined;
    if (rule.intervalDays && lastDate) {
      const nextDueDate = new Date(lastDate);
      nextDueDate.setDate(nextDueDate.getDate() + rule.intervalDays);
      const today = new Date();
      daysRemaining = Math.floor(
        (nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Determina prioridade e status
    const { priority, status } = calculatePriorityAndStatus(
      kmRemaining,
      daysRemaining
    );

    calculations.push({
      type: rule.type,
      name: rule.name,
      nextDueKm,
      kmRemaining,
      daysRemaining,
      priority,
      status,
    });
  }

  // Ordena por prioridade (mais urgente primeiro)
  return calculations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Calcula prioridade e status baseado em km e tempo restantes
 */
function calculatePriorityAndStatus(
  kmRemaining: number,
  daysRemaining?: number
): { priority: 'low' | 'medium' | 'high' | 'critical'; status: string } {
  // Vencido
  if (kmRemaining <= 0 || (daysRemaining !== undefined && daysRemaining <= 0)) {
    return { priority: 'critical', status: 'overdue' };
  }

  // Urgente (menos de 200km ou 7 dias)
  if (kmRemaining <= 200 || (daysRemaining !== undefined && daysRemaining <= 7)) {
    return { priority: 'high', status: 'urgent' };
  }

  // Atenção (menos de 500km ou 30 dias)
  if (kmRemaining <= 500 || (daysRemaining !== undefined && daysRemaining <= 30)) {
    return { priority: 'medium', status: 'attention' };
  }

  // OK
  return { priority: 'low', status: 'ok' };
}

/**
 * Gera alertas automáticos baseado no cálculo de manutenção
 */
export function generateMaintenanceAlerts(
  motorcycleId: string,
  calculations: MaintenanceCalculation[]
): Alert[] {
  const alerts: Alert[] = [];

  for (const calc of calculations) {
    // Só gera alerta se for atenção, urgente ou vencido
    if (calc.status === 'ok') continue;

    const alert: Alert = {
      id: generateId(),
      motorcycleId,
      type: 'maintenance_due',
      title: `${calc.name} - ${calc.status === 'overdue' ? 'VENCIDO' : calc.status.toUpperCase()}`,
      message: generateAlertMessage(calc),
      priority: calc.priority,
      dueKm: calc.nextDueKm,
      isRead: false,
      createdAt: new Date(),
    };

    alerts.push(alert);
  }

  return alerts;
}

/**
 * Gera mensagem do alerta
 */
function generateAlertMessage(calc: MaintenanceCalculation): string {
  if (calc.status === 'overdue') {
    return `${calc.name} está VENCIDA! Já passou ${Math.abs(calc.kmRemaining)}km do prazo.`;
  }

  if (calc.status === 'urgent') {
    const kmMsg = `Faltam apenas ${calc.kmRemaining}km`;
    const daysMsg = calc.daysRemaining !== undefined ? ` ou ${calc.daysRemaining} dias` : '';
    return `${calc.name} está próxima! ${kmMsg}${daysMsg}.`;
  }

  if (calc.status === 'attention') {
    const kmMsg = `Faltam ${calc.kmRemaining}km`;
    const daysMsg = calc.daysRemaining !== undefined ? ` ou ${calc.daysRemaining} dias` : '';
    return `${calc.name} se aproxima. ${kmMsg}${daysMsg}.`;
  }

  return `${calc.name} em dia.`;
}

/**
 * Recalcula todas as manutenções quando km é atualizada
 */
export async function recalculateMaintenanceOnKmUpdate(
  motorcycle: Motorcycle | FleetMotorcycle,
  maintenanceHistory: MaintenanceRecord[],
  rules: MaintenanceRule[]
): Promise<{
  calculations: MaintenanceCalculation[];
  alerts: Alert[];
}> {
  const calculations = calculateMaintenanceSchedule(
    motorcycle,
    maintenanceHistory,
    rules
  );

  const alerts = generateMaintenanceAlerts(motorcycle.id, calculations);

  return { calculations, alerts };
}

/**
 * Valida se manutenção pode ser registrada
 */
export function validateMaintenanceRecord(
  record: Partial<MaintenanceRecord>,
  motorcycle: Motorcycle | FleetMotorcycle
): { valid: boolean; error?: string } {
  if (!record.type) {
    return { valid: false, error: 'Tipo de manutenção é obrigatório' };
  }

  if (!record.km || record.km < 0) {
    return { valid: false, error: 'Quilometragem inválida' };
  }

  if (record.km > motorcycle.currentKm + 1000) {
    return {
      valid: false,
      error: 'Quilometragem da manutenção não pode ser muito maior que a atual',
    };
  }

  return { valid: true };
}

/**
 * Calcula custo médio de manutenção
 */
export function calculateAverageMaintenanceCost(
  records: MaintenanceRecord[]
): number {
  if (records.length === 0) return 0;

  const total = records.reduce((sum, record) => sum + (record.cost || 0), 0);
  return total / records.length;
}

/**
 * Calcula próxima revisão geral
 */
export function calculateNextGeneralRevision(
  currentKm: number,
  lastRevisionKm: number,
  interval: number = 5000
): number {
  return lastRevisionKm + interval;
}
