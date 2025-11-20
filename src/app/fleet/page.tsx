'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bike, 
  Bell, 
  Settings, 
  LogOut, 
  Plus, 
  Users, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateFleetPlan, formatCurrency } from '@/lib/fleet-utils';
import type { FleetMotorcycle, Renter, Alert } from '@/lib/types';

export default function FleetDashboardPage() {
  const router = useRouter();
  const [motorcycles, setMotorcycles] = useState<FleetMotorcycle[]>([]);
  const [renters, setRenters] = useState<Renter[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    // Carregar dados da frota
    loadFleetData();
  }, []);

  const loadFleetData = () => {
    // TODO: Carregar dados do localStorage ou API
    const storedMotorcycles = localStorage.getItem('fleetMotorcycles');
    const storedRenters = localStorage.getItem('fleetRenters');
    const storedAlerts = localStorage.getItem('fleetAlerts');

    if (storedMotorcycles) {
      setMotorcycles(JSON.parse(storedMotorcycles));
    }
    if (storedRenters) {
      setRenters(JSON.parse(storedRenters));
    }
    if (storedAlerts) {
      setAlerts(JSON.parse(storedAlerts));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userMode');
    router.push('/');
  };

  // Calcular estatísticas
  const fleetPlan = calculateFleetPlan(motorcycles.length);
  const activeMotorcycles = motorcycles.filter(m => m.status === 'in_use').length;
  const maintenanceMotorcycles = motorcycles.filter(m => m.status === 'maintenance').length;
  const urgentAlerts = alerts.filter(a => a.priority === 'critical' || a.priority === 'high').length;
  const activeRenters = renters.filter(r => r.status === 'active').length;
  const totalKm = motorcycles.reduce((sum, m) => sum + m.currentKm, 0);
  const totalMaintenanceCost = motorcycles.reduce((sum, m) => sum + m.maintenanceCost, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bike className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">AxionRide</h1>
                <p className="text-sm text-purple-300">Modo Frota</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:bg-white/10 relative">
                <Bell className="w-5 h-5" />
                {urgentAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {urgentAlerts}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={() => router.push('/fleet/settings')}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Dashboard da Frota
          </h2>
          <p className="text-gray-400">Visão geral completa da sua frota de motos</p>
        </div>

        {/* Plano da Frota */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Plano da Frota</h3>
              <p className="text-purple-100">
                {fleetPlan.currentMotorcycles} motos cadastradas
              </p>
            </div>
            <DollarSign className="w-12 h-12 opacity-50" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-purple-100 text-sm">Motos Incluídas</p>
              <p className="text-2xl font-bold">{fleetPlan.baseMotorcycles}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Motos Extras</p>
              <p className="text-2xl font-bold">{fleetPlan.extraMotorcycles}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm">Custo Extra/Ano</p>
              <p className="text-2xl font-bold">{formatCurrency(fleetPlan.annualExtraCost)}</p>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Motos Ativas"
            value={activeMotorcycles.toString()}
            subtitle={`de ${motorcycles.length} total`}
            icon={<Bike className="w-6 h-6" />}
            color="from-blue-500 to-cyan-600"
          />
          <StatCard
            title="Em Manutenção"
            value={maintenanceMotorcycles.toString()}
            subtitle="motos"
            icon={<Wrench className="w-6 h-6" />}
            color="from-orange-500 to-red-600"
          />
          <StatCard
            title="Locatários Ativos"
            value={activeRenters.toString()}
            subtitle="motoristas"
            icon={<Users className="w-6 h-6" />}
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            title="Alertas Urgentes"
            value={urgentAlerts.toString()}
            subtitle="requerem atenção"
            icon={<AlertTriangle className="w-6 h-6" />}
            color="from-red-500 to-pink-600"
          />
        </div>

        {/* Resumo Financeiro e Operacional */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Resumo Operacional</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Quilometragem Total</span>
                <span className="text-white font-bold">{totalKm.toLocaleString('pt-BR')} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Média por Moto</span>
                <span className="text-white font-bold">
                  {motorcycles.length > 0 ? Math.round(totalKm / motorcycles.length).toLocaleString('pt-BR') : 0} km
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Custo de Manutenção</span>
                <span className="text-white font-bold">{formatCurrency(totalMaintenanceCost)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                onClick={() => router.push('/fleet/add-motorcycle')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Moto
              </Button>
              <Button 
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                onClick={() => router.push('/fleet/manage-renters')}
              >
                <Users className="w-5 h-5 mr-2" />
                Gerenciar Locatários
              </Button>
              <Button 
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                onClick={() => router.push('/fleet/motorcycles')}
              >
                <Bike className="w-5 h-5 mr-2" />
                Ver Todas as Motos
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Motos */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Motos da Frota</h3>
            <Button 
              variant="ghost" 
              className="text-purple-400 hover:text-purple-300"
              onClick={() => router.push('/fleet/motorcycles')}
            >
              Ver todas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {motorcycles.length === 0 ? (
            <div className="text-center py-12">
              <Bike className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Nenhuma moto cadastrada ainda</p>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                onClick={() => router.push('/fleet/add-motorcycle')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Cadastrar Primeira Moto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {motorcycles.slice(0, 5).map((motorcycle) => (
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

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-br ${color} rounded-lg p-3 text-white`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-500 text-sm">{subtitle}</p>
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
    ok: 'text-green-400',
    attention: 'text-yellow-400',
    urgent: 'text-red-400',
  };

  return (
    <div 
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-purple-500/20 rounded-lg p-3">
            <Bike className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-bold">{motorcycle.brand} {motorcycle.model}</h4>
            <p className="text-gray-400 text-sm">{motorcycle.plate} • {motorcycle.year}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Quilometragem</p>
            <p className="text-white font-bold">{motorcycle.currentKm.toLocaleString('pt-BR')} km</p>
          </div>
          <div className={`px-3 py-1 rounded-full border text-sm ${statusColors[motorcycle.status]}`}>
            {motorcycle.status === 'available' && 'Disponível'}
            {motorcycle.status === 'in_use' && 'Em Uso'}
            {motorcycle.status === 'maintenance' && 'Manutenção'}
            {motorcycle.status === 'inactive' && 'Inativa'}
          </div>
          <div className={`${maintenanceColors[motorcycle.maintenanceStatus]}`}>
            {motorcycle.maintenanceStatus === 'ok' && '✓'}
            {motorcycle.maintenanceStatus === 'attention' && '⚠'}
            {motorcycle.maintenanceStatus === 'urgent' && '⚠'}
          </div>
        </div>
      </div>
      {motorcycle.renterName && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Locatário: <span className="text-white">{motorcycle.renterName}</span>
          </p>
        </div>
      )}
    </div>
  );
}
