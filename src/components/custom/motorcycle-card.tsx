import { LucideIcon } from 'lucide-react';

interface MotorcycleCardProps {
  brand: string;
  model: string;
  year: number;
  plate: string;
  km: number;
  status: 'good' | 'warning' | 'danger';
  renter?: string;
  onClick?: () => void;
}

export function MotorcycleCard({
  brand,
  model,
  year,
  plate,
  km,
  status,
  renter,
  onClick,
}: MotorcycleCardProps) {
  const statusColors = {
    good: 'border-green-500 bg-green-500/5',
    warning: 'border-yellow-500 bg-yellow-500/5',
    danger: 'border-red-500 bg-red-500/5',
  };

  const statusLabels = {
    good: 'Em dia',
    warning: 'Atenção',
    danger: 'Urgente',
  };

  return (
    <div
      className={`axion-card cursor-pointer hover:scale-105 transition-transform ${statusColors[status]} border-2`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            {brand} {model}
          </h3>
          <p className="text-gray-400 text-sm">{year} • {plate}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'good'
              ? 'bg-green-500/20 text-green-400'
              : status === 'warning'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Quilometragem</span>
          <span className="text-white font-semibold">{km.toLocaleString('pt-BR')} km</span>
        </div>

        {renter && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Locatário</span>
            <span className="text-cyan-400 font-medium">{renter}</span>
          </div>
        )}
      </div>
    </div>
  );
}
