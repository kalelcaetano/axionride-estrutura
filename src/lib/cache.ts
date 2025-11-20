// AxionRide - Sistema de Cache
// Cache inteligente para otimizar performance e reduzir chamadas ao backend

// ===================================
// TIPOS
// ===================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface CacheOptions {
  expiresIn?: number; // em milissegundos
  forceRefresh?: boolean;
}

// ===================================
// CLASSE DE CACHE
// ===================================

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private defaultExpiration: number;

  constructor(defaultExpiration: number = 5 * 60 * 1000) { // 5 minutos padrão
    this.cache = new Map();
    this.defaultExpiration = defaultExpiration;
  }

  /**
   * Define um valor no cache
   */
  set<T>(key: string, data: T, expiresIn?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresIn || this.defaultExpiration,
    };
    this.cache.set(key, entry);
  }

  /**
   * Obtém um valor do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verifica se expirou
    const now = Date.now();
    const age = now - entry.timestamp;
    
    if (age > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Remove um valor do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Limpa cache expirado
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.expiresIn) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Verifica se uma chave existe e não expirou
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Obtém ou define um valor (com função de fetch)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Se forceRefresh, ignora cache
    if (options?.forceRefresh) {
      const data = await fetchFn();
      this.set(key, data, options?.expiresIn);
      return data;
    }

    // Tenta obter do cache
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Se não existe, busca e armazena
    const data = await fetchFn();
    this.set(key, data, options?.expiresIn);
    return data;
  }
}

// ===================================
// INSTÂNCIA GLOBAL
// ===================================

export const cache = new CacheManager();

// ===================================
// HELPERS ESPECÍFICOS DO AXIONRIDE
// ===================================

/**
 * Cache de alertas (5 minutos)
 */
export async function getCachedAlerts(
  userId: string,
  fetchFn: () => Promise<any[]>,
  forceRefresh = false
): Promise<any[]> {
  const key = `alerts:${userId}`;
  return cache.getOrSet(key, fetchFn, {
    expiresIn: 5 * 60 * 1000, // 5 minutos
    forceRefresh,
  });
}

/**
 * Cache de quilometragem (2 minutos)
 */
export async function getCachedKm(
  motorcycleId: string,
  fetchFn: () => Promise<number>,
  forceRefresh = false
): Promise<number> {
  const key = `km:${motorcycleId}`;
  return cache.getOrSet(key, fetchFn, {
    expiresIn: 2 * 60 * 1000, // 2 minutos
    forceRefresh,
  });
}

/**
 * Cache de recomendações de peças (30 minutos)
 */
export async function getCachedPartRecommendations(
  partName: string,
  fetchFn: () => Promise<any[]>,
  forceRefresh = false
): Promise<any[]> {
  const key = `parts:${partName}`;
  return cache.getOrSet(key, fetchFn, {
    expiresIn: 30 * 60 * 1000, // 30 minutos
    forceRefresh,
  });
}

/**
 * Cache de histórico de manutenção (10 minutos)
 */
export async function getCachedMaintenanceHistory(
  motorcycleId: string,
  fetchFn: () => Promise<any[]>,
  forceRefresh = false
): Promise<any[]> {
  const key = `history:${motorcycleId}`;
  return cache.getOrSet(key, fetchFn, {
    expiresIn: 10 * 60 * 1000, // 10 minutos
    forceRefresh,
  });
}

/**
 * Cache de dashboard da frota (3 minutos)
 */
export async function getCachedFleetDashboard(
  adminId: string,
  fetchFn: () => Promise<any>,
  forceRefresh = false
): Promise<any> {
  const key = `fleet:dashboard:${adminId}`;
  return cache.getOrSet(key, fetchFn, {
    expiresIn: 3 * 60 * 1000, // 3 minutos
    forceRefresh,
  });
}

/**
 * Cache de motos da frota (5 minutos)
 */
export async function getCachedFleetMotorcycles(
  adminId: string,
  fetchFn: () => Promise<any[]>,
  forceRefresh = false
): Promise<any[]> {
  const key = `fleet:motorcycles:${adminId}`;
  return cache.getOrSet(key, fetchFn, {
    expiresIn: 5 * 60 * 1000, // 5 minutos
    forceRefresh,
  });
}

/**
 * Cache de regras de manutenção (1 hora)
 */
export async function getCachedMaintenanceRules(
  motorcycleId: string,
  fetchFn: () => Promise<any[]>,
  forceRefresh = false
): Promise<any[]> {
  const key = `rules:${motorcycleId}`;
  return cache.getOrSet(key, fetchFn, {
    expiresIn: 60 * 60 * 1000, // 1 hora
    forceRefresh,
  });
}

/**
 * Invalida cache relacionado a uma moto
 */
export function invalidateMotorcycleCache(motorcycleId: string): void {
  cache.delete(`km:${motorcycleId}`);
  cache.delete(`history:${motorcycleId}`);
  cache.delete(`rules:${motorcycleId}`);
}

/**
 * Invalida cache relacionado a alertas
 */
export function invalidateAlertsCache(userId: string): void {
  cache.delete(`alerts:${userId}`);
}

/**
 * Invalida cache da frota
 */
export function invalidateFleetCache(adminId: string): void {
  cache.delete(`fleet:dashboard:${adminId}`);
  cache.delete(`fleet:motorcycles:${adminId}`);
}

/**
 * Limpa todo o cache (usar com cuidado)
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Limpa cache expirado automaticamente
 * Executar periodicamente (ex: a cada 10 minutos)
 */
export function startCacheCleanup(intervalMs: number = 10 * 60 * 1000): void {
  setInterval(() => {
    cache.clearExpired();
  }, intervalMs);
}

// ===================================
// EXPORT
// ===================================

export default cache;
