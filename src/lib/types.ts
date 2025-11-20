// AxionRide - Tipos TypeScript

export type UserMode = 'motoboy' | 'personal' | 'fleet';
export type UserRole = 'admin' | 'renter'; // Para modo frota

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  mode: UserMode;
  role?: UserRole; // Para modo frota
  fleetOwnerId?: string; // ID do administrador da frota (para locatários)
  createdAt: Date;
}

export interface Motorcycle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  currentKm: number;
  lastMaintenanceKm: number;
  nextMaintenanceKm: number;
  manualData?: MotorcycleManual;
  createdAt: Date;
}

export interface MotorcycleManual {
  brand: string;
  model: string;
  oilChangeInterval: number; // km
  filterChangeInterval: number;
  tireChangeInterval: number;
  brakeCheckInterval: number;
  chainMaintenanceInterval: number;
  generalRevisionInterval: number;
}

export interface MaintenanceRecord {
  id: string;
  motorcycleId: string;
  type: MaintenanceType;
  description: string;
  km: number;
  cost: number;
  date: Date;
  nextDueKm?: number;
  parts?: Part[];
  performedBy?: string; // ID do usuário que realizou
  comments?: string;
}

export type MaintenanceType = 
  | 'oil_change'
  | 'oil_filter'
  | 'air_filter'
  | 'chain_kit'
  | 'tire_change'
  | 'brake_fluid'
  | 'brake_service'
  | 'chain_maintenance'
  | 'general_revision'
  | 'other';

export interface Part {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  compatibleModels: string[];
}

export interface Alert {
  id: string;
  motorcycleId: string;
  type: AlertType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueKm?: number;
  dueDate?: Date;
  isRead: boolean;
  createdAt: Date;
}

export type AlertType = 
  | 'maintenance_due'
  | 'part_wear'
  | 'revision_reminder'
  | 'km_milestone'
  | 'custom';

// Modo Motoboy
export interface MotoboyTrip {
  id: string;
  userId: string;
  motorcycleId: string;
  startKm: number;
  endKm: number;
  earnings: number;
  fuelCost: number;
  date: Date;
  duration: number; // minutos
}

export interface MotoboyStats {
  totalTrips: number;
  totalKm: number;
  totalEarnings: number;
  totalCosts: number;
  netProfit: number;
  averageKmPerTrip: number;
  costPerKm: number;
  profitPerKm: number;
}

// Modo Frota - COMPLETO
export interface FleetMotorcycle extends Motorcycle {
  fleetOwnerId: string; // ID do administrador da frota
  currentRenterId?: string; // ID do locatário atual
  renterName?: string; // Nome do locatário atual
  status: 'available' | 'in_use' | 'maintenance' | 'inactive';
  maintenanceStatus: 'ok' | 'attention' | 'urgent';
  totalKm: number;
  maintenanceCost: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  isLocked?: boolean; // Administrador pode bloquear edição
}

export interface Renter {
  id: string;
  fleetOwnerId: string; // ID do administrador da frota
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  cnh?: string;
  assignedMotorcycleId?: string; // Moto atribuída
  status: 'active' | 'inactive';
  canEditMaintenance: boolean; // Permissão para editar histórico
  createdAt: Date;
}

export interface FleetPlan {
  baseMotorcycles: number; // 5 motos no plano base
  extraMotorcycleCost: number; // R$ 10 por moto extra/ano
  currentMotorcycles: number;
  extraMotorcycles: number;
  annualExtraCost: number;
}

export interface FleetReport {
  period: {
    start: Date;
    end: Date;
  };
  totalMotorcycles: number;
  activeMotorcycles: number;
  motorcyclesInMaintenance: number;
  availableMotorcycles: number;
  totalKm: number;
  totalMaintenanceCost: number;
  averageCostPerMotorcycle: number;
  motorcyclesNeedingMaintenance: number;
  activeRenters: number;
  urgentAlerts: number;
}

export interface FleetMaintenanceHistory {
  motorcycleId: string;
  oilChange?: {
    lastDate: Date;
    lastKm: number;
    nextDue: number;
  };
  oilFilter?: {
    lastDate: Date;
    lastKm: number;
    nextDue: number;
  };
  airFilter?: {
    lastDate: Date;
    lastKm: number;
    nextDue: number;
  };
  chainKit?: {
    lastDate: Date;
    lastKm: number;
    nextDue: number;
  };
  tires?: {
    lastDate: Date;
    lastKm: number;
    nextDue: number;
  };
  brakeFluid?: {
    lastDate: Date;
    lastKm: number;
    nextDue: number;
  };
  otherMaintenance?: Array<{
    type: string;
    date: Date;
    km: number;
    description: string;
    cost: number;
  }>;
  comments?: string;
}

// Notificações
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'alert' | 'reminder' | 'info' | 'sync';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: {
    motorcycleId?: string;
    renterId?: string;
    syncType?: 'km_update' | 'alert_new' | 'maintenance_update';
  };
}
