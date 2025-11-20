// AxionRide - Constantes

export const APP_NAME = 'AxionRide';
export const APP_TAGLINE = 'Manutenção Inteligente para sua Moto';

// Modos de uso
export const USER_MODES = {
  motoboy: {
    id: 'motoboy',
    name: 'Motoboy',
    description: 'Para profissionais que trabalham com entregas',
    icon: 'Bike',
    color: 'from-orange-500 to-red-600',
    features: [
      'Controle de ganhos vs. desgaste',
      'Relatórios de corridas',
      'Alertas de manutenção preventiva',
      'Cálculo de custo por km'
    ]
  },
  personal: {
    id: 'personal',
    name: 'Uso Pessoal',
    description: 'Para quem usa a moto no dia a dia',
    icon: 'User',
    color: 'from-blue-500 to-cyan-600',
    features: [
      'Histórico completo da moto',
      'Agenda de manutenção',
      'Alertas inteligentes',
      'Recomendações de peças'
    ]
  },
  fleet: {
    id: 'fleet',
    name: 'Frota',
    description: 'Para locadoras e gestores de frotas',
    icon: 'Building2',
    color: 'from-purple-500 to-pink-600',
    features: [
      'Gestão de múltiplas motos',
      'Controle de motoristas',
      'Relatórios gerenciais',
      'Dashboard completo'
    ]
  }
} as const;

// Tipos de manutenção
export const MAINTENANCE_TYPES = {
  oil_change: {
    id: 'oil_change',
    name: 'Troca de Óleo',
    icon: 'Droplet',
    defaultInterval: 3000
  },
  oil_filter: {
    id: 'oil_filter',
    name: 'Filtro de Óleo',
    icon: 'Filter',
    defaultInterval: 3000
  },
  air_filter: {
    id: 'air_filter',
    name: 'Filtro de Ar',
    icon: 'Wind',
    defaultInterval: 6000
  },
  chain_kit: {
    id: 'chain_kit',
    name: 'Kit Relação',
    icon: 'Link',
    defaultInterval: 15000
  },
  tire_change: {
    id: 'tire_change',
    name: 'Troca de Pneus',
    icon: 'Circle',
    defaultInterval: 20000
  },
  brake_fluid: {
    id: 'brake_fluid',
    name: 'Fluido de Freio',
    icon: 'Droplets',
    defaultInterval: 12000
  },
  brake_service: {
    id: 'brake_service',
    name: 'Revisão de Freios',
    icon: 'AlertCircle',
    defaultInterval: 10000
  },
  chain_maintenance: {
    id: 'chain_maintenance',
    name: 'Manutenção de Corrente',
    icon: 'Link',
    defaultInterval: 1000
  },
  general_revision: {
    id: 'general_revision',
    name: 'Revisão Geral',
    icon: 'Wrench',
    defaultInterval: 5000
  }
} as const;

// Prioridades de alerta
export const ALERT_PRIORITIES = {
  low: {
    color: 'text-blue-600 bg-blue-50',
    icon: 'Info'
  },
  medium: {
    color: 'text-yellow-600 bg-yellow-50',
    icon: 'AlertTriangle'
  },
  high: {
    color: 'text-orange-600 bg-orange-50',
    icon: 'AlertCircle'
  },
  critical: {
    color: 'text-red-600 bg-red-50',
    icon: 'AlertOctagon'
  }
} as const;

// Marcas de motos populares
export const MOTORCYCLE_BRANDS = [
  'Honda',
  'Yamaha',
  'Suzuki',
  'Kawasaki',
  'BMW',
  'Ducati',
  'Harley-Davidson',
  'Royal Enfield',
  'KTM',
  'Triumph',
  'Outras'
] as const;

// Intervalos de manutenção padrão (em km)
export const DEFAULT_MAINTENANCE_INTERVALS = {
  oil_change: 3000,
  oil_filter: 3000,
  air_filter: 6000,
  chain_kit: 15000,
  tire_change: 20000,
  brake_fluid: 12000,
  brake_service: 10000,
  chain_maintenance: 1000,
  general_revision: 5000
} as const;

// Configurações do Modo Frota
export const FLEET_CONFIG = {
  BASE_MOTORCYCLES: 5, // Motos incluídas no plano base
  EXTRA_MOTORCYCLE_COST: 10, // R$ por moto extra/ano
  CURRENCY: 'R$',
  SYNC_INTERVAL: 30000, // 30 segundos para sincronização
} as const;

// Status de manutenção
export const MAINTENANCE_STATUS = {
  ok: {
    label: 'Em Dia',
    color: 'text-green-600 bg-green-50',
    icon: 'CheckCircle'
  },
  attention: {
    label: 'Atenção',
    color: 'text-yellow-600 bg-yellow-50',
    icon: 'AlertTriangle'
  },
  urgent: {
    label: 'Urgente',
    color: 'text-red-600 bg-red-50',
    icon: 'AlertOctagon'
  }
} as const;

// Status de moto na frota
export const FLEET_MOTORCYCLE_STATUS = {
  available: {
    label: 'Disponível',
    color: 'text-green-600 bg-green-50'
  },
  in_use: {
    label: 'Em Uso',
    color: 'text-blue-600 bg-blue-50'
  },
  maintenance: {
    label: 'Manutenção',
    color: 'text-orange-600 bg-orange-50'
  },
  inactive: {
    label: 'Inativa',
    color: 'text-gray-600 bg-gray-50'
  }
} as const;
