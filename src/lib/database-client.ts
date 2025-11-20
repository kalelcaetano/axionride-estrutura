// AxionRide - Cliente de Banco de Dados
// Funções para integração com PostgreSQL/Supabase

import type {
  User,
  Motorcycle,
  FleetMotorcycle,
  MaintenanceRecord,
  Alert,
} from './types';

// =====================================
// TIPOS ESPECÍFICOS DO BANCO
// =====================================

export interface DatabaseUser {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  tipo_usuario: 'motoboy' | 'viajante' | 'casa_trabalho' | 'premium' | 'frota_admin' | 'locatario';
  plano_assinatura?: string;
  data_assinatura?: Date;
  renovacao?: Date;
  cupom_usado: boolean;
  data_criacao: Date;
  data_atualizacao: Date;
}

export interface DatabaseMoto {
  id: string;
  admin_id: string;
  locatario_id?: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  km_atual: number;
  status_manutencao: 'ok' | 'atencao' | 'urgente';
  data_criacao: Date;
  data_atualizacao: Date;
}

export interface DatabaseOdometro {
  id: string;
  moto_id: string;
  usuario_id: string;
  km_anterior: number;
  km_nova: number;
  tipo_atualizacao: 'manual' | 'gps' | 'viagem' | 'frota_sync';
  data: Date;
}

export interface DatabaseHistoricoManutencao {
  id: string;
  moto_id: string;
  usuario_id: string;
  itens_trocados: Array<{ item: string; quantidade?: number }>;
  km: number;
  descricao?: string;
  custo?: number;
  mecanico?: string;
  data: Date;
}

export interface DatabaseRegrasManutencao {
  id: string;
  moto_id: string;
  item: string;
  intervalo_km: number;
  intervalo_tempo_dias?: number;
  criado_por: string;
  data: Date;
}

export interface DatabaseAlerta {
  id: string;
  moto_id: string;
  tipo_item: string;
  status_alerta: 'urgente' | 'atencao' | 'aviso';
  km_prevista?: number;
  data_prevista?: Date;
  data_geracao: Date;
  resolvido: boolean;
}

export interface DatabaseRecomendacao {
  id: string;
  moto_id: string;
  item: string;
  loja?: string;
  preco?: number;
  avaliacao?: number;
  link?: string;
  data: Date;
}

export interface DatabaseFrotaConfig {
  id: string;
  admin_id: string;
  total_motos_inclusas: number;
  total_extras: number;
  valor_extra_por_moto: number;
  valor_total_extras: number;
  data_atualizacao: Date;
}

// =====================================
// INTERFACE DO CLIENTE
// =====================================

export interface DatabaseClient {
  // Users
  createUser(data: Omit<DatabaseUser, 'id' | 'data_criacao' | 'data_atualizacao'>): Promise<DatabaseUser>;
  getUserByEmail(email: string): Promise<DatabaseUser | null>;
  getUserById(id: string): Promise<DatabaseUser | null>;
  updateUser(id: string, data: Partial<DatabaseUser>): Promise<DatabaseUser | null>;
  
  // Motos
  createMoto(data: Omit<DatabaseMoto, 'id' | 'data_criacao' | 'data_atualizacao'>): Promise<DatabaseMoto>;
  getMotoById(id: string): Promise<DatabaseMoto | null>;
  getMotosByAdmin(adminId: string): Promise<DatabaseMoto[]>;
  getMotoByLocatario(locatarioId: string): Promise<DatabaseMoto | null>;
  updateMoto(id: string, data: Partial<DatabaseMoto>): Promise<DatabaseMoto | null>;
  deleteMoto(id: string): Promise<boolean>;
  
  // Odômetro
  createOdometroLog(data: Omit<DatabaseOdometro, 'id' | 'data'>): Promise<DatabaseOdometro>;
  getOdometroByMoto(motoId: string, limit?: number): Promise<DatabaseOdometro[]>;
  
  // Histórico de Manutenção
  createHistoricoManutencao(data: Omit<DatabaseHistoricoManutencao, 'id' | 'data'>): Promise<DatabaseHistoricoManutencao>;
  getHistoricoByMoto(motoId: string): Promise<DatabaseHistoricoManutencao[]>;
  updateHistoricoManutencao(id: string, data: Partial<DatabaseHistoricoManutencao>): Promise<DatabaseHistoricoManutencao | null>;
  
  // Regras de Manutenção
  createRegrasManutencao(data: Omit<DatabaseRegrasManutencao, 'id' | 'data'>): Promise<DatabaseRegrasManutencao>;
  getRegrasByMoto(motoId: string): Promise<DatabaseRegrasManutencao[]>;
  updateRegrasManutencao(id: string, data: Partial<DatabaseRegrasManutencao>): Promise<DatabaseRegrasManutencao | null>;
  criarRegrasPadrao(motoId: string, usuarioId: string): Promise<void>;
  
  // Alertas
  createAlerta(data: Omit<DatabaseAlerta, 'id' | 'data_geracao'>): Promise<DatabaseAlerta>;
  getAlertasByMoto(motoId: string, apenasNaoResolvidos?: boolean): Promise<DatabaseAlerta[]>;
  updateAlerta(id: string, data: Partial<DatabaseAlerta>): Promise<DatabaseAlerta | null>;
  gerarAlertasAutomaticos(motoId: string): Promise<number>;
  
  // Recomendações
  createRecomendacao(data: Omit<DatabaseRecomendacao, 'id' | 'data'>): Promise<DatabaseRecomendacao>;
  getRecomendacoesByMoto(motoId: string): Promise<DatabaseRecomendacao[]>;
  
  // Frota Config
  createFrotaConfig(adminId: string): Promise<DatabaseFrotaConfig>;
  getFrotaConfigByAdmin(adminId: string): Promise<DatabaseFrotaConfig | null>;
  updateFrotaConfig(adminId: string, data: Partial<DatabaseFrotaConfig>): Promise<DatabaseFrotaConfig | null>;
  
  // Views e Relatórios
  getMotosResumo(adminId: string): Promise<any[]>;
  getHistoricoCompleto(motoId: string): Promise<any[]>;
  getDashboardFrota(adminId: string): Promise<any>;
  
  // Funções de Negócio
  calcularProximaManutencao(motoId: string, item: string): Promise<{
    km_prevista: number;
    data_prevista: Date;
    dias_restantes: number;
  } | null>;
}

// =====================================
// FUNÇÕES AUXILIARES DE CONVERSÃO
// =====================================

export function convertDatabaseUserToUser(dbUser: DatabaseUser): User {
  return {
    id: dbUser.id,
    name: dbUser.nome,
    email: dbUser.email,
    phone: '', // Adicionar campo phone no banco se necessário
    mode: mapTipoUsuarioToMode(dbUser.tipo_usuario),
    role: dbUser.tipo_usuario === 'frota_admin' ? 'admin' : 
          dbUser.tipo_usuario === 'locatario' ? 'renter' : undefined,
    createdAt: dbUser.data_criacao,
  };
}

export function convertDatabaseMotoToMotorcycle(dbMoto: DatabaseMoto): Motorcycle | FleetMotorcycle {
  const base = {
    id: dbMoto.id,
    userId: dbMoto.admin_id,
    brand: dbMoto.marca,
    model: dbMoto.modelo,
    year: dbMoto.ano,
    plate: dbMoto.placa,
    currentKm: dbMoto.km_atual,
    lastMaintenanceKm: 0, // Calcular do histórico
    nextMaintenanceKm: 0, // Calcular das regras
    createdAt: dbMoto.data_criacao,
  };

  // Se tem locatário, é FleetMotorcycle
  if (dbMoto.locatario_id) {
    return {
      ...base,
      fleetOwnerId: dbMoto.admin_id,
      currentRenterId: dbMoto.locatario_id,
      status: 'in_use',
      maintenanceStatus: dbMoto.status_manutencao,
      totalKm: dbMoto.km_atual,
      maintenanceCost: 0, // Calcular do histórico
      canEditMaintenance: false,
    } as FleetMotorcycle;
  }

  return base as Motorcycle;
}

export function convertDatabaseHistoricoToMaintenanceRecord(
  dbHistorico: DatabaseHistoricoManutencao
): MaintenanceRecord {
  return {
    id: dbHistorico.id,
    motorcycleId: dbHistorico.moto_id,
    type: 'other', // Mapear do itens_trocados
    description: dbHistorico.descricao || '',
    km: dbHistorico.km,
    cost: dbHistorico.custo || 0,
    date: dbHistorico.data,
    performedBy: dbHistorico.usuario_id,
    comments: dbHistorico.mecanico,
  };
}

export function convertDatabaseAlertaToAlert(dbAlerta: DatabaseAlerta): Alert {
  return {
    id: dbAlerta.id,
    motorcycleId: dbAlerta.moto_id,
    type: 'maintenance_due',
    title: `Manutenção: ${dbAlerta.tipo_item}`,
    message: `${dbAlerta.tipo_item} precisa de atenção`,
    priority: mapStatusAlertaToPriority(dbAlerta.status_alerta),
    dueKm: dbAlerta.km_prevista,
    dueDate: dbAlerta.data_prevista,
    isRead: dbAlerta.resolvido,
    createdAt: dbAlerta.data_geracao,
  };
}

// =====================================
// FUNÇÕES DE MAPEAMENTO
// =====================================

function mapTipoUsuarioToMode(tipo: string): 'motoboy' | 'personal' | 'fleet' {
  switch (tipo) {
    case 'motoboy':
      return 'motoboy';
    case 'frota_admin':
    case 'locatario':
      return 'fleet';
    default:
      return 'personal';
  }
}

function mapStatusAlertaToPriority(status: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (status) {
    case 'urgente':
      return 'critical';
    case 'atencao':
      return 'high';
    case 'aviso':
      return 'medium';
    default:
      return 'low';
  }
}

// =====================================
// VALIDAÇÕES
// =====================================

export function validateKmUpdate(kmAnterior: number, kmNova: number): boolean {
  if (kmNova < 0 || kmAnterior < 0) {
    throw new Error('Quilometragem não pode ser negativa');
  }
  if (kmNova < kmAnterior) {
    throw new Error('Nova quilometragem deve ser maior ou igual à anterior');
  }
  return true;
}

export function validatePlacaUnica(placa: string, adminId: string, motos: DatabaseMoto[]): boolean {
  const exists = motos.some(m => m.placa === placa && m.admin_id === adminId);
  if (exists) {
    throw new Error('Placa já cadastrada para este administrador');
  }
  return true;
}

export function validateLocatarioPermissions(
  tipoUsuario: string,
  operation: 'read' | 'write' | 'delete'
): boolean {
  if (tipoUsuario === 'locatario' && operation !== 'read') {
    throw new Error('Locatário não tem permissão para esta operação');
  }
  return true;
}

// =====================================
// QUERIES PREPARADAS
// =====================================

export const QUERIES = {
  // Users
  CREATE_USER: `
    INSERT INTO users (nome, email, senha_hash, tipo_usuario, plano_assinatura, cupom_usado)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
  
  GET_USER_BY_EMAIL: `
    SELECT * FROM users WHERE email = $1
  `,
  
  GET_USER_BY_ID: `
    SELECT * FROM users WHERE id = $1
  `,
  
  UPDATE_USER: `
    UPDATE users 
    SET nome = COALESCE($2, nome),
        plano_assinatura = COALESCE($3, plano_assinatura),
        data_assinatura = COALESCE($4, data_assinatura),
        renovacao = COALESCE($5, renovacao)
    WHERE id = $1
    RETURNING *
  `,
  
  // Motos
  CREATE_MOTO: `
    INSERT INTO motos (admin_id, marca, modelo, ano, placa, km_atual, status_manutencao)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
  
  GET_MOTOS_BY_ADMIN: `
    SELECT * FROM motos WHERE admin_id = $1 ORDER BY data_criacao DESC
  `,
  
  GET_MOTO_BY_LOCATARIO: `
    SELECT * FROM motos WHERE locatario_id = $1 LIMIT 1
  `,
  
  UPDATE_MOTO_KM: `
    UPDATE motos SET km_atual = $2 WHERE id = $1 RETURNING *
  `,
  
  // Odômetro
  CREATE_ODOMETRO_LOG: `
    INSERT INTO odometro (moto_id, usuario_id, km_anterior, km_nova, tipo_atualizacao)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
  
  GET_ODOMETRO_BY_MOTO: `
    SELECT * FROM odometro WHERE moto_id = $1 ORDER BY data DESC LIMIT $2
  `,
  
  // Histórico
  CREATE_HISTORICO: `
    INSERT INTO historico_manutencao (moto_id, usuario_id, itens_trocados, km, descricao, custo, mecanico)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
  
  GET_HISTORICO_BY_MOTO: `
    SELECT * FROM historico_manutencao WHERE moto_id = $1 ORDER BY data DESC
  `,
  
  // Alertas
  CREATE_ALERTA: `
    INSERT INTO alertas (moto_id, tipo_item, status_alerta, km_prevista, data_prevista)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
  
  GET_ALERTAS_BY_MOTO: `
    SELECT * FROM alertas WHERE moto_id = $1 AND resolvido = $2 ORDER BY data_geracao DESC
  `,
  
  GERAR_ALERTAS_AUTOMATICOS: `
    SELECT gerar_alertas_automaticos($1)
  `,
  
  // Regras
  CREATE_REGRAS_PADRAO: `
    SELECT criar_regras_padrao($1, $2)
  `,
  
  GET_REGRAS_BY_MOTO: `
    SELECT * FROM regras_manutencao WHERE moto_id = $1
  `,
  
  // Views
  GET_MOTOS_RESUMO: `
    SELECT * FROM v_motos_resumo WHERE admin_nome = (SELECT nome FROM users WHERE id = $1)
  `,
  
  GET_DASHBOARD_FROTA: `
    SELECT * FROM v_dashboard_frota WHERE admin_id = $1
  `,
  
  // Funções
  CALCULAR_PROXIMA_MANUTENCAO: `
    SELECT * FROM calcular_proxima_manutencao($1, $2)
  `,
};

// =====================================
// EXPORTAÇÕES
// =====================================

export type {
  DatabaseUser,
  DatabaseMoto,
  DatabaseOdometro,
  DatabaseHistoricoManutencao,
  DatabaseRegrasManutencao,
  DatabaseAlerta,
  DatabaseRecomendacao,
  DatabaseFrotaConfig,
};
