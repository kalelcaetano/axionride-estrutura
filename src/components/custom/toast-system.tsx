'use client';

// AxionRide - Sistema de Toast/Notificações
// Sistema unificado de mensagens e feedback visual

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/design-system';

// ===================================
// TIPOS
// ===================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ===================================
// CONTEXT
// ===================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// ===================================
// PROVIDER
// ===================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove após duração
    const duration = toast.duration || 5000;
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, hideToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

// ===================================
// COMPONENTE DE TOAST
// ===================================

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success: 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400',
    error: 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'border-2 rounded-lg p-4 shadow-lg backdrop-blur-sm animate-slide-up',
        'flex items-start gap-3 min-w-[320px]',
        styles[toast.type]
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs mt-1 opacity-90">{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ===================================
// MENSAGENS PADRONIZADAS
// ===================================

export const toastMessages = {
  // Autenticação
  auth: {
    loginSuccess: 'Login realizado com sucesso',
    loginError: 'Erro ao fazer login',
    registerSuccess: 'Cadastro realizado com sucesso',
    registerError: 'Erro ao criar conta',
    logoutSuccess: 'Logout realizado com sucesso',
    unauthorized: 'Você não tem permissão para acessar',
  },

  // Quilometragem
  km: {
    updateSuccess: 'KM atualizado com sucesso',
    updateError: 'Erro ao atualizar KM',
    invalidValue: 'Valor de KM inválido',
    gpsSuccess: 'KM atualizado via GPS',
    gpsError: 'Erro ao obter localização GPS',
  },

  // Manutenção
  maintenance: {
    registerSuccess: 'Manutenção registrada com sucesso',
    registerError: 'Erro ao registrar manutenção',
    updateSuccess: 'Manutenção atualizada',
    deleteSuccess: 'Manutenção removida',
  },

  // Alertas
  alerts: {
    resolveSuccess: 'Alerta resolvido',
    resolveError: 'Erro ao resolver alerta',
    generated: 'Novos alertas gerados',
  },

  // Frota
  fleet: {
    addBikeSuccess: 'Moto adicionada à frota',
    addBikeError: 'Erro ao adicionar moto',
    removeBikeSuccess: 'Moto removida da frota',
    assignRenterSuccess: 'Locatário vinculado com sucesso',
    assignRenterError: 'Erro ao vincular locatário',
    removeRenterSuccess: 'Locatário removido',
    extraBikesAdded: 'Motos extras adicionadas',
    extraBikesCalculated: 'Valor de motos extras calculado',
  },

  // Assinatura
  subscription: {
    updateSuccess: 'Plano atualizado com sucesso',
    updateError: 'Erro ao atualizar plano',
    couponApplied: 'Cupom TAVARES160 aplicado',
    couponError: 'Cupom inválido ou já utilizado',
    paymentSuccess: 'Pagamento processado com sucesso',
    paymentError: 'Erro ao processar pagamento',
  },

  // Manual
  manual: {
    uploadSuccess: 'Manual enviado com sucesso',
    uploadError: 'Erro ao enviar manual',
    extractSuccess: 'Regras extraídas do manual',
    extractError: 'Erro ao extrair regras',
  },

  // Peças
  parts: {
    recommendationLoaded: 'Recomendações carregadas',
    recommendationError: 'Erro ao carregar recomendações',
  },

  // Geral
  general: {
    saveSuccess: 'Salvo com sucesso',
    saveError: 'Erro ao salvar',
    deleteSuccess: 'Removido com sucesso',
    deleteError: 'Erro ao remover',
    loadError: 'Erro ao carregar dados',
    networkError: 'Erro de conexão',
    unknownError: 'Erro desconhecido',
  },
};

// ===================================
// EXPORT
// ===================================

export default ToastProvider;
