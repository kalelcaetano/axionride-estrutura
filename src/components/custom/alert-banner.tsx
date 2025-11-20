import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AlertBannerProps {
  type: 'urgent' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export function AlertBanner({ type, title, message, onDismiss }: AlertBannerProps) {
  const styles = {
    urgent: {
      container: 'axion-alert-urgent',
      icon: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
      defaultTitle: 'Urgente',
    },
    warning: {
      container: 'axion-alert-warning',
      icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" />,
      defaultTitle: 'Atenção',
    },
    info: {
      container: 'axion-alert-info',
      icon: <Info className="w-5 h-5 flex-shrink-0" />,
      defaultTitle: 'Informação',
    },
    success: {
      container: 'bg-green-500/10 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-lg p-4',
      icon: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
      defaultTitle: 'Sucesso',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.container} flex items-start gap-3`}>
      {style.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current hover:opacity-70 transition-opacity"
          aria-label="Fechar"
        >
          ×
        </button>
      )}
    </div>
  );
}
