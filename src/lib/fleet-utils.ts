// AxionRide - Utilitários do Modo Frota

import { FLEET_CONFIG } from './constants';
import type { FleetPlan, FleetMotorcycle } from './types';

/**
 * Calcula o plano da frota com base no número de motos
 */
export function calculateFleetPlan(currentMotorcycles: number): FleetPlan {
  const baseMotorcycles = FLEET_CONFIG.BASE_MOTORCYCLES;
  const extraMotorcycles = Math.max(0, currentMotorcycles - baseMotorcycles);
  const annualExtraCost = extraMotorcycles * FLEET_CONFIG.EXTRA_MOTORCYCLE_COST;

  return {
    baseMotorcycles,
    extraMotorcycleCost: FLEET_CONFIG.EXTRA_MOTORCYCLE_COST,
    currentMotorcycles,
    extraMotorcycles,
    annualExtraCost,
  };
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number): string {
  return `${FLEET_CONFIG.CURRENCY} ${value.toFixed(2).replace('.', ',')}`;
}

/**
 * Calcula status de manutenção baseado na quilometragem
 */
export function calculateMaintenanceStatus(
  currentKm: number,
  nextMaintenanceKm: number
): 'ok' | 'attention' | 'urgent' {
  const kmUntilMaintenance = nextMaintenanceKm - currentKm;
  
  if (kmUntilMaintenance <= 0) {
    return 'urgent';
  } else if (kmUntilMaintenance <= 500) {
    return 'attention';
  } else {
    return 'ok';
  }
}

/**
 * Verifica se usuário é administrador da frota
 */
export function isFleetAdmin(userId: string, fleetOwnerId: string): boolean {
  return userId === fleetOwnerId;
}

/**
 * Verifica se locatário pode editar a moto
 */
export function canRenterEdit(
  motorcycle: FleetMotorcycle,
  userId: string,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  if (motorcycle.isLocked) return false;
  return motorcycle.currentRenterId === userId;
}

/**
 * Gera ID único
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formata data para exibição
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Calcula próxima manutenção baseada no intervalo
 */
export function calculateNextMaintenance(
  currentKm: number,
  interval: number
): number {
  return currentKm + interval;
}

/**
 * Valida placa de moto (formato brasileiro)
 */
export function validatePlate(plate: string): boolean {
  // Formato antigo: ABC-1234
  const oldFormat = /^[A-Z]{3}-\d{4}$/;
  // Formato Mercosul: ABC1D23
  const mercosulFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return oldFormat.test(plate) || mercosulFormat.test(plate);
}

/**
 * Formata placa para exibição
 */
export function formatPlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}
