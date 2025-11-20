'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bike, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FleetMotorcycle } from '@/lib/types';

export default function MotorcyclesListPage() {
  const router = useRouter();
  const [motorcycles, setMotorcycles] = useState<FleetMotorcycle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadMotorcycles();
  }, []);

  const loadMotorcycles = () => {
    const storedMotorcycles = localStorage.getItem('fleetMotorcycles');
    if (storedMotorcycles) {
      setMotorcycles(JSON.parse(storedMotorcycles));
    }
  };

  const filteredMotorcycles = motorcycles.filter(motorcycle => {
    const matchesSearch = 
      motorcycle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorcycle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorcycle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      motorcycle.renterName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || motorcycle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Todas as Motos</h1>
              <p className="text-sm text-purple-300">{motorcycles.length} motos cadastradas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por marca, modelo, placa ou locatário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-slate-900">Todos os Status</option>
              <option value="available" className="bg-slate-900">Disponível</option>
              <option value="in_use" className="bg-slate-900">Em Uso</option>
              <option value="maintenance" className="bg-slate-900">Manutenção</option>
              <option value="inactive" className="bg-slate-900">Inativa</option>
            </select>
          </div>
        </div>

        {/* Lista de Motos */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          {filteredMotorcycles.length === 0 ? (
            <div className="text-center py-12">
              <Bike className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhuma moto encontrada com os filtros aplicados' 
                  : 'Nenhuma moto cadastrada ainda'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredMotorcycles.map((motorcycle) => (
                <MotorcycleCard
                  key={motorcycle.id}
                  motorcycle={motorcycle}
                  onClick={() => router.push(`/fleet/motorcycle/${motorcycle.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MotorcycleCardProps {
  motorcycle: FleetMotorcycle;
  onClick: () => void;
}

function MotorcycleCard({ motorcycle, onClick }: MotorcycleCardProps) {
  const statusColors = {
    available: 'bg-green-500/20 text-green-400 border-green-500/30',
    in_use: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const maintenanceColors = {
    ok: 'bg-green-500/20 text-green-400',
    attention: 'bg-yellow-500/20 text-yellow-400',
    urgent: 'bg-red-500/20 text-red-400',
  };

  const statusLabels = {
    available: 'Disponível',
    in_use: 'Em Uso',
    maintenance: 'Manutenção',
    inactive: 'Inativa',
  };

  const maintenanceLabels = {
    ok: 'Em Dia',
    attention: 'Atenção',
    urgent: 'Urgente',
  };

  return (
    <div
      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/20 rounded-lg p-3">
            <Bike className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">
              {motorcycle.brand} {motorcycle.model}
            </h3>
            <p className="text-gray-400 text-sm">{motorcycle.plate} • {motorcycle.year}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs ${statusColors[motorcycle.status]}`}>
          {statusLabels[motorcycle.status]}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Quilometragem</span>
          <span className="text-white font-bold">{motorcycle.currentKm.toLocaleString('pt-BR')} km</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Próxima Manutenção</span>
          <span className="text-white font-bold">{motorcycle.nextMaintenanceKm.toLocaleString('pt-BR')} km</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Status Manutenção</span>
          <span className={`px-2 py-1 rounded text-xs font-bold ${maintenanceColors[motorcycle.maintenanceStatus]}`}>
            {maintenanceLabels[motorcycle.maintenanceStatus]}
          </span>
        </div>

        {motorcycle.renterName && (
          <div className="pt-3 border-t border-white/10">
            <span className="text-gray-400 text-sm">Locatário: </span>
            <span className="text-purple-400 font-medium">{motorcycle.renterName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
