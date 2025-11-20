'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Bell, Settings, LogOut, Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserMode } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [userMode, setUserMode] = useState<UserMode>('personal');

  useEffect(() => {
    // Verificar modo do usuário
    const mode = localStorage.getItem('userMode') as UserMode;
    if (mode) {
      setUserMode(mode);
      
      // Redirecionar para dashboard específico do modo frota
      if (mode === 'fleet') {
        router.push('/fleet');
        return;
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userMode');
    router.push('/');
  };

  // Se for modo frota, não renderizar nada (vai redirecionar)
  if (userMode === 'fleet') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bike className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">AxionRide</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
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
            Dashboard {userMode === 'motoboy' ? 'Motoboy' : 'Pessoal'}
          </h2>
          <p className="text-gray-400">Bem-vindo ao seu painel de controle</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Motos Cadastradas"
            value="0"
            icon={<Bike className="w-6 h-6" />}
            color="from-cyan-500 to-blue-600"
          />
          <StatCard
            title="Alertas Ativos"
            value="0"
            icon={<AlertCircle className="w-6 h-6" />}
            color="from-orange-500 to-red-600"
          />
          <StatCard
            title="Manutenções Agendadas"
            value="0"
            icon={<TrendingUp className="w-6 h-6" />}
            color="from-purple-500 to-pink-600"
          />
        </div>

        {/* Ação Principal */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
          <Bike className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Cadastre sua primeira moto
          </h3>
          <p className="text-gray-400 mb-6">
            Comece a acompanhar a manutenção e o desempenho da sua moto
          </p>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Moto
          </Button>
        </div>

        {/* Próximas Manutenções */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Próximas Manutenções</h3>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <p className="text-gray-400 text-center">
              Nenhuma manutenção agendada no momento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-br ${color} rounded-lg p-3 text-white`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
