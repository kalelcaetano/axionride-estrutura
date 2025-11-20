// AxionRide - Design System Unificado
// Sistema de design completo para padronização visual

export const designSystem = {
  // ===================================
  // CORES
  // ===================================
  colors: {
    // Cores Primárias
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Cores de Status
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
    },
    
    // Gradientes
    gradients: {
      primary: 'from-cyan-500 to-blue-600',
      secondary: 'from-purple-500 to-pink-600',
      success: 'from-green-500 to-emerald-600',
      danger: 'from-orange-500 to-red-600',
      fleet: 'from-purple-600 via-pink-600 to-purple-700',
    },
  },

  // ===================================
  // ESPAÇAMENTOS
  // ===================================
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // ===================================
  // BORDAS
  // ===================================
  borderRadius: {
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px',
  },

  // ===================================
  // SOMBRAS
  // ===================================
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  },

  // ===================================
  // TIPOGRAFIA
  // ===================================
  typography: {
    // Tamanhos
    sizes: {
      xs: 'text-xs',      // 12px
      sm: 'text-sm',      // 14px
      base: 'text-base',  // 16px
      lg: 'text-lg',      // 18px
      xl: 'text-xl',      // 20px
      '2xl': 'text-2xl',  // 24px
      '3xl': 'text-3xl',  // 30px
      '4xl': 'text-4xl',  // 36px
    },
    
    // Pesos
    weights: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },

  // ===================================
  // COMPONENTES PRÉ-DEFINIDOS
  // ===================================
  components: {
    // Cards
    card: {
      base: 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-lg transition-all duration-300',
      glass: 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300',
      hover: 'hover:shadow-2xl hover:scale-[1.02]',
    },
    
    // Botões
    button: {
      primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105',
      secondary: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105',
      outline: 'border-2 border-blue-500 text-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300',
      ghost: 'text-gray-600 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-300',
      danger: 'bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105',
    },
    
    // Inputs
    input: {
      base: 'w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-all duration-200',
      error: 'border-red-500 focus:ring-red-500',
    },
    
    // Alertas
    alert: {
      urgent: 'bg-red-500/10 border-2 border-red-500 text-red-600 dark:text-red-400 rounded-lg p-4 flex items-start gap-3',
      warning: 'bg-yellow-500/10 border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400 rounded-lg p-4 flex items-start gap-3',
      info: 'bg-blue-500/10 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg p-4 flex items-start gap-3',
      success: 'bg-green-500/10 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-lg p-4 flex items-start gap-3',
    },
    
    // Status Indicators
    status: {
      good: 'inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium',
      warning: 'inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-medium',
      danger: 'inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-sm font-medium',
    },
    
    // Badges
    badge: {
      primary: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400',
      success: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400',
      warning: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
      danger: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-600 dark:text-red-400',
    },
  },

  // ===================================
  // ANIMAÇÕES
  // ===================================
  animations: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
  },

  // ===================================
  // TRANSIÇÕES
  // ===================================
  transitions: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },
};

// ===================================
// HELPERS
// ===================================

/**
 * Combina classes CSS de forma segura
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Retorna classe de status baseado no tipo
 */
export function getStatusClass(status: 'good' | 'warning' | 'danger'): string {
  return designSystem.components.status[status];
}

/**
 * Retorna classe de alerta baseado no tipo
 */
export function getAlertClass(type: 'urgent' | 'warning' | 'info' | 'success'): string {
  return designSystem.components.alert[type];
}

/**
 * Retorna classe de badge baseado no tipo
 */
export function getBadgeClass(type: 'primary' | 'success' | 'warning' | 'danger'): string {
  return designSystem.components.badge[type];
}

/**
 * Retorna classe de botão baseado no tipo
 */
export function getButtonClass(type: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'): string {
  return designSystem.components.button[type];
}

// ===================================
// EXPORT DEFAULT
// ===================================
export default designSystem;
