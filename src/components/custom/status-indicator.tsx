import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'good' | 'warning' | 'danger';
  label: string;
  showIcon?: boolean;
}

export function StatusIndicator({ status, label, showIcon = true }: StatusIndicatorProps) {
  const styles = {
    good: {
      className: 'axion-status-good',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    warning: {
      className: 'axion-status-warning',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    danger: {
      className: 'axion-status-danger',
      icon: <XCircle className="w-4 h-4" />,
    },
  };

  const style = styles[status];

  return (
    <span className={style.className}>
      {showIcon && style.icon}
      {label}
    </span>
  );
}
