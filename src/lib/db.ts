// AxionRide - Simulação de Banco de Dados (In-Memory)
// Em produção, substituir por Prisma, Supabase ou MongoDB

import type {
  User,
  Motorcycle,
  FleetMotorcycle,
  Renter,
  MaintenanceRecord,
  Alert,
  Notification,
  MotoboyTrip,
} from './types';
import { generateId } from './fleet-utils';

// =====================================
// TIPOS ADICIONAIS DO BANCO
// =====================================

export interface DatabaseOdometro {
  id: string;
  motoId: string;
  usuarioId: string;
  kmAnterior: number;
  kmNova: number;
  tipoAtualizacao: 'manual' | 'gps' | 'viagem' | 'frota_sync';
  data: Date;
}

export interface DatabaseRegrasManutencao {
  id: string;
  motoId: string;
  item: string;
  intervaloKm: number;
  intervaloTempoDias?: number;
  criadoPor: string;
  data: Date;
}

export interface DatabaseRecomendacao {
  id: string;
  motoId: string;
  item: string;
  loja?: string;
  preco?: number;
  avaliacao?: number;
  link?: string;
  data: Date;
}

export interface DatabaseFrotaConfig {
  id: string;
  adminId: string;
  totalMotosInclusas: number;
  totalExtras: number;
  valorExtraPorMoto: number;
  valorTotalExtras: number;
  dataAtualizacao: Date;
}

// Banco de dados em memória
const db = {
  users: new Map<string, User & { password: string; subscription?: any }>(),
  motorcycles: new Map<string, Motorcycle | FleetMotorcycle>(),
  renters: new Map<string, Renter>(),
  maintenanceRecords: new Map<string, MaintenanceRecord>(),
  alerts: new Map<string, Alert>(),
  notifications: new Map<string, Notification>(),
  motoboyTrips: new Map<string, MotoboyTrip>(),
  subscriptions: new Map<string, any>(),
  maintenanceRules: new Map<string, any>(),
  kmUpdates: new Map<string, any>(),
  // NOVAS TABELAS
  odometro: new Map<string, DatabaseOdometro>(),
  regrasManutencao: new Map<string, DatabaseRegrasManutencao>(),
  recomendacoes: new Map<string, DatabaseRecomendacao>(),
  frotaConfig: new Map<string, DatabaseFrotaConfig>(),
};

// ==================== USERS ====================

export async function createUser(
  data: Omit<User, 'id' | 'createdAt'> & { password: string }
): Promise<User> {
  const id = generateId();
  const user: User & { password: string } = {
    ...data,
    id,
    createdAt: new Date(),
  };

  db.users.set(id, user);
  return user;
}

export async function getUserByEmail(email: string): Promise<(User & { password: string }) | null> {
  for (const user of db.users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

export async function getUserById(id: string): Promise<User | null> {
  const user = db.users.get(id);
  if (!user) return null;
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  const user = db.users.get(id);
  if (!user) return null;

  const updated = { ...user, ...data };
  db.users.set(id, updated);

  const { password, ...userWithoutPassword } = updated;
  return userWithoutPassword;
}

// ==================== SUBSCRIPTIONS ====================

export async function createSubscription(userId: string, data: any): Promise<any> {
  const id = generateId();
  const subscription = {
    id,
    userId,
    ...data,
    createdAt: new Date(),
  };

  db.subscriptions.set(id, subscription);
  return subscription;
}

export async function getSubscriptionByUserId(userId: string): Promise<any | null> {
  for (const sub of db.subscriptions.values()) {
    if (sub.userId === userId) {
      return sub;
    }
  }
  return null;
}

export async function updateSubscription(userId: string, data: any): Promise<any | null> {
  for (const [id, sub] of db.subscriptions.entries()) {
    if (sub.userId === userId) {
      const updated = { ...sub, ...data, updatedAt: new Date() };
      db.subscriptions.set(id, updated);
      return updated;
    }
  }
  return null;
}

// ==================== MOTORCYCLES ====================

export async function createMotorcycle(data: Omit<Motorcycle, 'id' | 'createdAt'>): Promise<Motorcycle> {
  const id = generateId();
  const motorcycle: Motorcycle = {
    ...data,
    id,
    createdAt: new Date(),
  };

  db.motorcycles.set(id, motorcycle);
  
  // Criar regras de manutenção padrão
  await criarRegrasPadrao(id, data.userId);
  
  return motorcycle;
}

export async function createFleetMotorcycle(
  data: Omit<FleetMotorcycle, 'id' | 'createdAt'>
): Promise<FleetMotorcycle> {
  const id = generateId();
  const motorcycle: FleetMotorcycle = {
    ...data,
    id,
    createdAt: new Date(),
  };

  db.motorcycles.set(id, motorcycle);
  
  // Criar regras de manutenção padrão
  await criarRegrasPadrao(id, data.fleetOwnerId);
  
  return motorcycle;
}

export async function getMotorcycleById(id: string): Promise<Motorcycle | FleetMotorcycle | null> {
  return db.motorcycles.get(id) || null;
}

export async function getMotorcyclesByUserId(userId: string): Promise<(Motorcycle | FleetMotorcycle)[]> {
  const motorcycles: (Motorcycle | FleetMotorcycle)[] = [];
  
  for (const moto of db.motorcycles.values()) {
    if (moto.userId === userId) {
      motorcycles.push(moto);
    }
  }
  
  return motorcycles;
}

export async function getFleetMotorcycles(fleetOwnerId: string): Promise<FleetMotorcycle[]> {
  const motorcycles: FleetMotorcycle[] = [];
  
  for (const moto of db.motorcycles.values()) {
    if ('fleetOwnerId' in moto && moto.fleetOwnerId === fleetOwnerId) {
      motorcycles.push(moto as FleetMotorcycle);
    }
  }
  
  return motorcycles;
}

export async function updateMotorcycle(
  id: string,
  data: Partial<Motorcycle | FleetMotorcycle>
): Promise<Motorcycle | FleetMotorcycle | null> {
  const motorcycle = db.motorcycles.get(id);
  if (!motorcycle) return null;

  // Se km_atual mudou, registrar no odômetro
  if (data.currentKm !== undefined && data.currentKm !== motorcycle.currentKm) {
    await createOdometroLog({
      motoId: id,
      usuarioId: motorcycle.userId,
      kmAnterior: motorcycle.currentKm,
      kmNova: data.currentKm,
      tipoAtualizacao: 'frota_sync',
    });
  }

  const updated = { ...motorcycle, ...data };
  db.motorcycles.set(id, updated);
  
  // Gerar alertas automáticos após atualização
  await gerarAlertasAutomaticos(id);
  
  return updated;
}

export async function deleteMotorcycle(id: string): Promise<boolean> {
  return db.motorcycles.delete(id);
}

// ==================== RENTERS ====================

export async function createRenter(data: Omit<Renter, 'id' | 'createdAt'>): Promise<Renter> {
  const id = generateId();
  const renter: Renter = {
    ...data,
    id,
    createdAt: new Date(),
  };

  db.renters.set(id, renter);
  return renter;
}

export async function getRenterById(id: string): Promise<Renter | null> {
  return db.renters.get(id) || null;
}

export async function getRentersByFleetOwner(fleetOwnerId: string): Promise<Renter[]> {
  const renters: Renter[] = [];
  
  for (const renter of db.renters.values()) {
    if (renter.fleetOwnerId === fleetOwnerId) {
      renters.push(renter);
    }
  }
  
  return renters;
}

export async function updateRenter(id: string, data: Partial<Renter>): Promise<Renter | null> {
  const renter = db.renters.get(id);
  if (!renter) return null;

  const updated = { ...renter, ...data };
  db.renters.set(id, updated);
  return updated;
}

export async function deleteRenter(id: string): Promise<boolean> {
  return db.renters.delete(id);
}

// ==================== MAINTENANCE RECORDS ====================

export async function createMaintenanceRecord(
  data: Omit<MaintenanceRecord, 'id' | 'date'>
): Promise<MaintenanceRecord> {
  const id = generateId();
  const record: MaintenanceRecord = {
    ...data,
    id,
    date: new Date(),
  };

  db.maintenanceRecords.set(id, record);
  
  // Gerar alertas após registrar manutenção
  await gerarAlertasAutomaticos(data.motorcycleId);
  
  return record;
}

export async function getMaintenanceRecordsByMotorcycle(
  motorcycleId: string
): Promise<MaintenanceRecord[]> {
  const records: MaintenanceRecord[] = [];
  
  for (const record of db.maintenanceRecords.values()) {
    if (record.motorcycleId === motorcycleId) {
      records.push(record);
    }
  }
  
  return records.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function updateMaintenanceRecord(
  id: string,
  data: Partial<MaintenanceRecord>
): Promise<MaintenanceRecord | null> {
  const record = db.maintenanceRecords.get(id);
  if (!record) return null;

  const updated = { ...record, ...data };
  db.maintenanceRecords.set(id, updated);
  return updated;
}

// ==================== ALERTS ====================

export async function createAlert(data: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
  const id = generateId();
  const alert: Alert = {
    ...data,
    id,
    createdAt: new Date(),
  };

  db.alerts.set(id, alert);
  return alert;
}

export async function getAlertsByMotorcycle(motorcycleId: string): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  for (const alert of db.alerts.values()) {
    if (alert.motorcycleId === motorcycleId) {
      alerts.push(alert);
    }
  }
  
  return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function updateAlert(id: string, data: Partial<Alert>): Promise<Alert | null> {
  const alert = db.alerts.get(id);
  if (!alert) return null;

  const updated = { ...alert, ...data };
  db.alerts.set(id, updated);
  return updated;
}

export async function deleteAlert(id: string): Promise<boolean> {
  return db.alerts.delete(id);
}

// ==================== NOTIFICATIONS ====================

export async function createNotification(
  data: Omit<Notification, 'id' | 'createdAt'>
): Promise<Notification> {
  const id = generateId();
  const notification: Notification = {
    ...data,
    id,
    createdAt: new Date(),
  };

  db.notifications.set(id, notification);
  return notification;
}

export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  const notifications: Notification[] = [];
  
  for (const notif of db.notifications.values()) {
    if (notif.userId === userId) {
      notifications.push(notif);
    }
  }
  
  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// ==================== KM UPDATES ====================

export async function createKmUpdate(data: any): Promise<any> {
  const id = generateId();
  const update = {
    id,
    ...data,
    createdAt: new Date(),
  };

  db.kmUpdates.set(id, update);
  return update;
}

export async function getKmUpdatesByMotorcycle(motorcycleId: string): Promise<any[]> {
  const updates: any[] = [];
  
  for (const update of db.kmUpdates.values()) {
    if (update.motorcycleId === motorcycleId) {
      updates.push(update);
    }
  }
  
  return updates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// ==================== MAINTENANCE RULES ====================

export async function saveMaintenanceRules(motorcycleId: string, rules: any): Promise<any> {
  const id = generateId();
  const ruleData = {
    id,
    motorcycleId,
    rules,
    createdAt: new Date(),
  };

  db.maintenanceRules.set(motorcycleId, ruleData);
  return ruleData;
}

export async function getMaintenanceRules(motorcycleId: string): Promise<any | null> {
  return db.maintenanceRules.get(motorcycleId) || null;
}

// ==================== ODÔMETRO (NOVA TABELA) ====================

export async function createOdometroLog(
  data: Omit<DatabaseOdometro, 'id' | 'data'>
): Promise<DatabaseOdometro> {
  // Validar progressão de KM
  if (data.kmNova < data.kmAnterior) {
    throw new Error('Nova quilometragem deve ser maior ou igual à anterior');
  }
  if (data.kmNova < 0 || data.kmAnterior < 0) {
    throw new Error('Quilometragem não pode ser negativa');
  }

  const id = generateId();
  const log: DatabaseOdometro = {
    ...data,
    id,
    data: new Date(),
  };

  db.odometro.set(id, log);
  return log;
}

export async function getOdometroByMoto(motoId: string, limit: number = 50): Promise<DatabaseOdometro[]> {
  const logs: DatabaseOdometro[] = [];
  
  for (const log of db.odometro.values()) {
    if (log.motoId === motoId) {
      logs.push(log);
    }
  }
  
  return logs
    .sort((a, b) => b.data.getTime() - a.data.getTime())
    .slice(0, limit);
}

// ==================== REGRAS DE MANUTENÇÃO (NOVA TABELA) ====================

export async function createRegrasManutencao(
  data: Omit<DatabaseRegrasManutencao, 'id' | 'data'>
): Promise<DatabaseRegrasManutencao> {
  if (data.intervaloKm <= 0) {
    throw new Error('Intervalo de KM deve ser positivo');
  }

  const id = generateId();
  const regra: DatabaseRegrasManutencao = {
    ...data,
    id,
    data: new Date(),
  };

  db.regrasManutencao.set(id, regra);
  return regra;
}

export async function getRegrasByMoto(motoId: string): Promise<DatabaseRegrasManutencao[]> {
  const regras: DatabaseRegrasManutencao[] = [];
  
  for (const regra of db.regrasManutencao.values()) {
    if (regra.motoId === motoId) {
      regras.push(regra);
    }
  }
  
  return regras;
}

export async function criarRegrasPadrao(motoId: string, usuarioId: string): Promise<void> {
  const regrasDefault = [
    { item: 'oleo', intervaloKm: 3000, intervaloTempoDias: 180 },
    { item: 'filtro_oleo', intervaloKm: 3000, intervaloTempoDias: 180 },
    { item: 'filtro_ar', intervaloKm: 6000, intervaloTempoDias: 365 },
    { item: 'kit_relacao', intervaloKm: 15000, intervaloTempoDias: 730 },
    { item: 'pneus', intervaloKm: 20000, intervaloTempoDias: 1095 },
    { item: 'fluido_freio', intervaloKm: 12000, intervaloTempoDias: 730 },
    { item: 'velas', intervaloKm: 10000, intervaloTempoDias: 365 },
    { item: 'revisao_geral', intervaloKm: 5000, intervaloTempoDias: 365 },
  ];

  for (const regra of regrasDefault) {
    await createRegrasManutencao({
      motoId,
      item: regra.item,
      intervaloKm: regra.intervaloKm,
      intervaloTempoDias: regra.intervaloTempoDias,
      criadoPor: usuarioId,
    });
  }
}

// ==================== RECOMENDAÇÕES (NOVA TABELA) ====================

export async function createRecomendacao(
  data: Omit<DatabaseRecomendacao, 'id' | 'data'>
): Promise<DatabaseRecomendacao> {
  const id = generateId();
  const recomendacao: DatabaseRecomendacao = {
    ...data,
    id,
    data: new Date(),
  };

  db.recomendacoes.set(id, recomendacao);
  return recomendacao;
}

export async function getRecomendacoesByMoto(motoId: string): Promise<DatabaseRecomendacao[]> {
  const recomendacoes: DatabaseRecomendacao[] = [];
  
  for (const rec of db.recomendacoes.values()) {
    if (rec.motoId === motoId) {
      recomendacoes.push(rec);
    }
  }
  
  return recomendacoes.sort((a, b) => b.data.getTime() - a.data.getTime());
}

// ==================== FROTA CONFIG (NOVA TABELA) ====================

export async function createFrotaConfig(adminId: string): Promise<DatabaseFrotaConfig> {
  const id = generateId();
  const config: DatabaseFrotaConfig = {
    id,
    adminId,
    totalMotosInclusas: 5,
    totalExtras: 0,
    valorExtraPorMoto: 10,
    valorTotalExtras: 0,
    dataAtualizacao: new Date(),
  };

  db.frotaConfig.set(adminId, config);
  return config;
}

export async function getFrotaConfigByAdmin(adminId: string): Promise<DatabaseFrotaConfig | null> {
  return db.frotaConfig.get(adminId) || null;
}

export async function updateFrotaConfig(
  adminId: string,
  data: Partial<DatabaseFrotaConfig>
): Promise<DatabaseFrotaConfig | null> {
  const config = db.frotaConfig.get(adminId);
  if (!config) return null;

  const updated = {
    ...config,
    ...data,
    // Recalcular valor total extras
    valorTotalExtras: (data.totalExtras ?? config.totalExtras) * config.valorExtraPorMoto,
    dataAtualizacao: new Date(),
  };

  db.frotaConfig.set(adminId, updated);
  return updated;
}

// ==================== FUNÇÕES DE NEGÓCIO ====================

export async function gerarAlertasAutomaticos(motoId: string): Promise<number> {
  const moto = await getMotorcycleById(motoId);
  if (!moto) return 0;

  const regras = await getRegrasByMoto(motoId);
  const historico = await getMaintenanceRecordsByMotorcycle(motoId);
  let alertasGerados = 0;

  for (const regra of regras) {
    // Buscar última manutenção deste item
    const ultimaManutencao = historico.find(h => 
      h.description?.toLowerCase().includes(regra.item.toLowerCase())
    );

    const kmUltimaManutencao = ultimaManutencao?.km || 0;
    const kmProxima = kmUltimaManutencao + regra.intervaloKm;
    const kmAtual = moto.currentKm;

    // Determinar status do alerta
    let statusAlerta: 'urgente' | 'atencao' | 'aviso';
    if (kmAtual >= kmProxima) {
      statusAlerta = 'urgente';
    } else if (kmAtual >= kmProxima - (regra.intervaloKm * 0.1)) {
      statusAlerta = 'atencao';
    } else {
      statusAlerta = 'aviso';
    }

    // Criar alerta se não existir um não resolvido
    const alertasExistentes = await getAlertsByMotorcycle(motoId);
    const alertaExiste = alertasExistentes.some(a => 
      a.title.includes(regra.item) && !a.isRead
    );

    if (!alertaExiste) {
      await createAlert({
        motorcycleId: motoId,
        type: 'maintenance_due',
        title: `Manutenção: ${regra.item}`,
        message: `${regra.item} precisa de atenção`,
        priority: statusAlerta === 'urgente' ? 'critical' : 
                 statusAlerta === 'atencao' ? 'high' : 'medium',
        dueKm: kmProxima,
        isRead: false,
      });
      alertasGerados++;
    }
  }

  return alertasGerados;
}

export async function calcularProximaManutencao(
  motoId: string,
  item: string
): Promise<{ kmPrevista: number; dataPrevista: Date; diasRestantes: number } | null> {
  const moto = await getMotorcycleById(motoId);
  if (!moto) return null;

  const regras = await getRegrasByMoto(motoId);
  const regra = regras.find(r => r.item === item);
  if (!regra) return null;

  const historico = await getMaintenanceRecordsByMotorcycle(motoId);
  const ultimaManutencao = historico.find(h => 
    h.description?.toLowerCase().includes(item.toLowerCase())
  );

  const kmUltimaManutencao = ultimaManutencao?.km || 0;
  const kmPrevista = kmUltimaManutencao + regra.intervaloKm;

  const dataPrevista = new Date();
  if (regra.intervaloTempoDias) {
    dataPrevista.setDate(dataPrevista.getDate() + regra.intervaloTempoDias);
  }

  const diasRestantes = regra.intervaloTempoDias || 0;

  return {
    kmPrevista,
    dataPrevista,
    diasRestantes,
  };
}

// ==================== VIEWS E RELATÓRIOS ====================

export async function getMotosResumo(adminId: string): Promise<any[]> {
  const motos = await getFleetMotorcycles(adminId);
  const resumo = [];

  for (const moto of motos) {
    const alertas = await getAlertsByMotorcycle(moto.id);
    const alertasPendentes = alertas.filter(a => !a.isRead);
    const alertasUrgentes = alertasPendentes.filter(a => a.priority === 'critical');

    resumo.push({
      id: moto.id,
      marca: moto.brand,
      modelo: moto.model,
      placa: moto.plate,
      kmAtual: moto.currentKm,
      statusManutencao: moto.maintenanceStatus,
      locatarioNome: moto.renterName || null,
      alertasPendentes: alertasPendentes.length,
      alertasUrgentes: alertasUrgentes.length,
    });
  }

  return resumo;
}

export async function getDashboardFrota(adminId: string): Promise<any> {
  const motos = await getFleetMotorcycles(adminId);
  const config = await getFrotaConfigByAdmin(adminId);
  const renters = await getRentersByFleetOwner(adminId);

  const motosEmUso = motos.filter(m => m.status === 'in_use').length;
  const motosUrgente = motos.filter(m => m.maintenanceStatus === 'urgente').length;
  const kmTotalFrota = motos.reduce((sum, m) => sum + m.currentKm, 0);

  let alertasPendentes = 0;
  for (const moto of motos) {
    const alertas = await getAlertsByMotorcycle(moto.id);
    alertasPendentes += alertas.filter(a => !a.isRead).length;
  }

  return {
    adminId,
    totalMotos: motos.length,
    motosEmUso,
    motosUrgente,
    kmTotalFrota,
    alertasPendentes,
    locatariosAtivos: renters.filter(r => r.status === 'active').length,
    totalMotosInclusas: config?.totalMotosInclusas || 5,
    totalExtras: config?.totalExtras || 0,
    valorTotalExtras: config?.valorTotalExtras || 0,
  };
}

// ==================== UTILITY ====================

export function clearDatabase(): void {
  db.users.clear();
  db.motorcycles.clear();
  db.renters.clear();
  db.maintenanceRecords.clear();
  db.alerts.clear();
  db.notifications.clear();
  db.motoboyTrips.clear();
  db.subscriptions.clear();
  db.maintenanceRules.clear();
  db.kmUpdates.clear();
  db.odometro.clear();
  db.regrasManutencao.clear();
  db.recomendacoes.clear();
  db.frotaConfig.clear();
}
