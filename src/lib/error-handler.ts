// AxionRide - Sistema de Tratamento de Erros
// Padronização de erros e respostas amigáveis

import { NextResponse } from 'next/server';

// ===================================
// TIPOS DE ERRO
// ===================================

export enum ErrorCode {
  // Autenticação
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validação
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_FIELDS = 'MISSING_FIELDS',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Recursos
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Permissões
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Negócio
  INVALID_KM = 'INVALID_KM',
  COUPON_ALREADY_USED = 'COUPON_ALREADY_USED',
  COUPON_INVALID = 'COUPON_INVALID',
  FLEET_LIMIT_REACHED = 'FLEET_LIMIT_REACHED',
  MOTORCYCLE_ALREADY_ASSIGNED = 'MOTORCYCLE_ALREADY_ASSIGNED',
  
  // Sistema
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

// ===================================
// CLASSE DE ERRO CUSTOMIZADA
// ===================================

export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: any;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

// ===================================
// MENSAGENS DE ERRO PADRONIZADAS
// ===================================

export const errorMessages = {
  // Autenticação
  [ErrorCode.UNAUTHORIZED]: 'Você precisa estar autenticado para acessar',
  [ErrorCode.INVALID_CREDENTIALS]: 'E-mail ou senha incorretos',
  [ErrorCode.TOKEN_EXPIRED]: 'Sua sessão expirou. Faça login novamente',
  [ErrorCode.INVALID_TOKEN]: 'Token de autenticação inválido',
  
  // Validação
  [ErrorCode.VALIDATION_ERROR]: 'Dados inválidos',
  [ErrorCode.MISSING_FIELDS]: 'Campos obrigatórios não preenchidos',
  [ErrorCode.INVALID_FORMAT]: 'Formato de dados inválido',
  
  // Recursos
  [ErrorCode.NOT_FOUND]: 'Recurso não encontrado',
  [ErrorCode.ALREADY_EXISTS]: 'Recurso já existe',
  
  // Permissões
  [ErrorCode.FORBIDDEN]: 'Você não tem permissão para acessar',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Permissões insuficientes',
  
  // Negócio
  [ErrorCode.INVALID_KM]: 'Quilometragem inválida',
  [ErrorCode.COUPON_ALREADY_USED]: 'Cupom já foi utilizado',
  [ErrorCode.COUPON_INVALID]: 'Cupom inválido',
  [ErrorCode.FLEET_LIMIT_REACHED]: 'Limite de motos atingido',
  [ErrorCode.MOTORCYCLE_ALREADY_ASSIGNED]: 'Moto já está atribuída a outro locatário',
  
  // Sistema
  [ErrorCode.INTERNAL_ERROR]: 'Erro interno do servidor',
  [ErrorCode.DATABASE_ERROR]: 'Erro ao acessar banco de dados',
  [ErrorCode.NETWORK_ERROR]: 'Erro de conexão',
};

// ===================================
// HELPERS
// ===================================

/**
 * Cria um erro de autenticação
 */
export function unauthorizedError(message?: string): AppError {
  return new AppError(
    ErrorCode.UNAUTHORIZED,
    message || errorMessages[ErrorCode.UNAUTHORIZED],
    401
  );
}

/**
 * Cria um erro de validação
 */
export function validationError(message?: string, details?: any): AppError {
  return new AppError(
    ErrorCode.VALIDATION_ERROR,
    message || errorMessages[ErrorCode.VALIDATION_ERROR],
    400,
    details
  );
}

/**
 * Cria um erro de recurso não encontrado
 */
export function notFoundError(resource: string): AppError {
  return new AppError(
    ErrorCode.NOT_FOUND,
    `${resource} não encontrado`,
    404
  );
}

/**
 * Cria um erro de permissão
 */
export function forbiddenError(message?: string): AppError {
  return new AppError(
    ErrorCode.FORBIDDEN,
    message || errorMessages[ErrorCode.FORBIDDEN],
    403
  );
}

/**
 * Cria um erro interno
 */
export function internalError(message?: string, details?: any): AppError {
  return new AppError(
    ErrorCode.INTERNAL_ERROR,
    message || errorMessages[ErrorCode.INTERNAL_ERROR],
    500,
    details
  );
}

// ===================================
// HANDLER DE ERRO PARA API ROUTES
// ===================================

/**
 * Converte erro em resposta JSON padronizada
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Se é um AppError customizado
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Se é um erro padrão do JavaScript
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: error.message,
        },
      },
      { status: 500 }
    );
  }

  // Erro desconhecido
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Erro desconhecido',
      },
    },
    { status: 500 }
  );
}

/**
 * Wrapper para API routes com tratamento de erro automático
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<NextResponse>
) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// ===================================
// VALIDAÇÕES COMUNS
// ===================================

/**
 * Valida campos obrigatórios
 */
export function validateRequiredFields(
  data: Record<string, any>,
  fields: string[]
): void {
  const missing = fields.filter((field) => !data[field]);
  
  if (missing.length > 0) {
    throw validationError(
      `Campos obrigatórios: ${missing.join(', ')}`,
      { missing }
    );
  }
}

/**
 * Valida formato de e-mail
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    throw validationError('Formato de e-mail inválido');
  }
}

/**
 * Valida quilometragem
 */
export function validateKm(km: number, previousKm?: number): void {
  if (km < 0) {
    throw new AppError(
      ErrorCode.INVALID_KM,
      'Quilometragem não pode ser negativa',
      400
    );
  }
  
  if (previousKm !== undefined && km < previousKm) {
    throw new AppError(
      ErrorCode.INVALID_KM,
      'Quilometragem não pode ser menor que a anterior',
      400
    );
  }
}

/**
 * Valida cupom
 */
export function validateCoupon(coupon: string, alreadyUsed: boolean): void {
  if (coupon !== 'TAVARES160') {
    throw new AppError(
      ErrorCode.COUPON_INVALID,
      'Cupom inválido',
      400
    );
  }
  
  if (alreadyUsed) {
    throw new AppError(
      ErrorCode.COUPON_ALREADY_USED,
      'Cupom já foi utilizado',
      400
    );
  }
}

// ===================================
// LOGGER
// ===================================

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  action: string;
  userId?: string;
  details?: any;
}

class Logger {
  private logs: LogEntry[] = [];

  log(level: 'info' | 'warn' | 'error', action: string, userId?: string, details?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      action,
      userId,
      details,
    };
    
    this.logs.push(entry);
    
    // Em produção, enviar para serviço de logging
    console.log(`[${level.toUpperCase()}] ${action}`, { userId, details });
  }

  info(action: string, userId?: string, details?: any): void {
    this.log('info', action, userId, details);
  }

  warn(action: string, userId?: string, details?: any): void {
    this.log('warn', action, userId, details);
  }

  error(action: string, userId?: string, details?: any): void {
    this.log('error', action, userId, details);
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();

// ===================================
// EXPORT
// ===================================

export default {
  AppError,
  handleApiError,
  withErrorHandler,
  logger,
};
