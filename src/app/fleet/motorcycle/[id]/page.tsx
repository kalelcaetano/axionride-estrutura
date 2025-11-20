'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Bike, 
  Edit, 
  Trash2, 
  UserCheck, 
  Calendar,
  Gauge,
  Wrench,
  AlertTriangle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/fleet-utils';
import type { FleetMotorcycle, MaintenanceRecord, Renter } from '@/lib/types';

export default function MotorcycleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const motorcycleId = params.id as string;
  
  const [motorcycle, setMotorcycle] = useState<FleetMotorcycle | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [renter, setRenter] = useState<Renter | null>(null);

  useEffect(() => {
    loadMotorcycleData();
  }, [motorcycleId]);

  const loadMotorcycleData = () => {
    // Carregar moto
    const storedMotorcycles = localStorage.getItem('fleetMotorcycles');
    if (storedMotorcycles) {
      const motorcycles: FleetMotorcycle[] = JSON.parse(storedMotorcycles);
      const foundMotorcycle = motorcycles.find(m => m.id === motorcycleId);
      if (foundMotorcycle) {
        setMotorcycle(foundMotorcycle);

        // Carregar locatário se houver
        if (foundMotorcycle.currentRenterId) {
          const storedRenters = localStorage.getItem('fleetRenters');
          if (storedRenters) {
            const renters: Renter[] = JSON.parse(storedRenters);
            const foundRenter = renters.find(r => r.id === foundMotorcycle.currentRenterId);
            if (foundRenter) {
              setRenter(foundRenter);
            }
          }
        }
      }
    }

    // Carregar histórico de manutenção
    const storedMaintenance = localStorage.getItem(`maintenance_${motorcycleId}`);
    if (storedMaintenance) {
      setMaintenanceHistory(JSON.parse(storedMaintenance));
    }
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja remover esta moto da frota?')) {
      const storedMotorcycles = localStorage.getItem('fleetMotorcycles');
      if (storedMotorcycles) {
        const motorcycles: FleetMotorcycle[] = JSON.parse(storedMotorcycles);
        const updatedMotorcycles = motorcycles.filter(m => m.id !== motorcycleId);
        localStorage.setItem('fleetMotorcycles', JSON.stringify(updatedMotorcycles));
        router.push('/fleet/motorcycles');
      }
    }
  };

  if (!motorcycle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

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

  const kmUntilMaintenance = motorcycle.nextMaintenanceKm - motorcycle.currentKm;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {motorcycle.brand} {motorcycle.model}
                </h1>
                <p className="text-sm text-purple-300">{motorcycle.plate} • {motorcycle.year}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => router.push(`/fleet/edit-motorcycle/${motorcycleId}`)}
              >
                <Edit className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                className="text-red-400 hover:bg-red-500/10"
                onClick={handleDelete}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Cards de Informações Principais */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <InfoCard
            icon={<Gauge className="w-6 h-6" />}
            label="Quilometragem Atual"
            value={`${motorcycle.currentKm.toLocaleString('pt-BR')} km`}
            color="from-blue-500 to-cyan-600"
          />
          <InfoCard
            icon={<Calendar className="w-6 h-6" />}
            label="Próxima Manutenção"
            value={`${motorcycle.nextMaintenanceKm.toLocaleString('pt-BR')} km`}
            subtitle={`${kmUntilMaintenance > 0 ? 'em ' + kmUntilMaintenance : 'ATRASADA'} km`}
            color="from-purple-500 to-pink-600"
          />
          <InfoCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Custo Manutenção"
            value={formatCurrency(motorcycle.maintenanceCost)}
            color="from-green-500 to-emerald-600"
          />
          <InfoCard
            icon={<Wrench className="w-6 h-6" />}
            label="Status Manutenção"
            value={motorcycle.maintenanceStatus === 'ok' ? 'Em Dia' : motorcycle.maintenanceStatus === 'attention' ? 'Atenção' : 'Urgente'}
            color={
              motorcycle.maintenanceStatus === 'ok' 
                ? 'from-green-500 to-emerald-600' 
                : motorcycle.maintenanceStatus === 'attention'
                ? 'from-yellow-500 to-orange-600'
                : 'from-red-500 to-pink-600'
            }
          />
        </div>

        {/* Status e Locatário */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Status da Moto */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Status da Moto</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status Atual</span>
                <span className={`px-3 py-1 rounded-full border text-sm ${statusColors[motorcycle.status]}`}>
                  {motorcycle.status === 'available' && 'Disponível'}
                  {motorcycle.status === 'in_use' && 'Em Uso'}
                  {motorcycle.status === 'maintenance' && 'Manutenção'}
                  {motorcycle.status === 'inactive' && 'Inativa'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Bloqueada para Edição</span>
                <span className="text-white font-bold">{motorcycle.isLocked ? 'Sim' : 'Não'}</span>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white mt-4"
                onClick={() => router.push(`/fleet/update-km/${motorcycleId}`)}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Atualizar Quilometragem
              </Button>
            </div>
          </div>

          {/* Locatário Atual */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Locatário Atual</h3>
            {renter ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 rounded-full p-3">
                    <UserCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{renter.name}</p>
                    <p className="text-gray-400 text-sm">{renter.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Telefone</span>
                    <span className="text-white">{renter.phone}</span>
                  </div>
                  {renter.cpf && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">CPF</span>
                      <span className="text-white">{renter.cpf}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 mt-4"
                  onClick={() => router.push(`/fleet/change-renter/${motorcycleId}`)}
                >
                  Trocar Motorista
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">Nenhum locatário atribuído</p>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  onClick={() => router.push(`/fleet/assign-renter/${motorcycleId}`)}
                >
                  Atribuir Motorista
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Histórico de Manutenção */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Histórico de Manutenção</h3>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              onClick={() => router.push(`/fleet/add-maintenance/${motorcycleId}`)}
            >
              <Wrench className="w-5 h-5 mr-2" />
              Adicionar Manutenção
            </Button>
          </div>

          {maintenanceHistory.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma manutenção registrada ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceHistory.map((record) => (
                <MaintenanceCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
}

function InfoCard({ icon, label, value, subtitle, color }: InfoCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <div className={`bg-gradient-to-br ${color} rounded-lg p-3 text-white w-fit mb-4`}>
        {icon}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

interface MaintenanceCardProps {
  record: MaintenanceRecord;
}

function MaintenanceCard({ record }: MaintenanceCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="w-5 h-5 text-purple-400" />
            <h4 className="text-white font-bold">{record.description}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Data: </span>
              <span className="text-white">{formatDate(new Date(record.date))}</span>
            </div>
            <div>
              <span className="text-gray-400">Quilometragem: </span>
              <span className="text-white">{record.km.toLocaleString('pt-BR')} km</span>
            </div>
            <div>
              <span className="text-gray-400">Custo: </span>
              <span className="text-white">{formatCurrency(record.cost)}</span>
            </div>
            {record.nextDueKm && (
              <div>
                <span className="text-gray-400">Próxima: </span>
                <span className="text-white">{record.nextDueKm.toLocaleString('pt-BR')} km</span>
              </div>
            )}
          </div>
          {record.comments && (
            <p className="text-gray-400 text-sm mt-2">{record.comments}</p>
          )}
        </div>
      </div>
    </div>
  );
}
