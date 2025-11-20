'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bike, ArrowLeft, Bell, Filter, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertBanner } from '@/components/custom/alert-banner';
import { StatusIndicator } from '@/components/custom/status-indicator';

interface Alert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  item: string;
  message: string;
  kmPrevista: number;
  dataPrevista: string;
  resolvido: boolean;
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'warning' | 'info'>('all');
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'urgent',
      item: 'Troca de Óleo',
      message: 'Troca de óleo vencida há 500 km',
      kmPrevista: 5000,
      dataPrevista: '2024-01-15',
      resolvido: false,
    },
    {
      id: '2',
      type: 'warning',
      item: 'Filtro de Ar',
      message: 'Faltam 200 km para trocar o filtro de ar',
      kmPrevista: 10000,
      dataPrevista: '2024-02-01',
      resolvido: false,
    },
    {
      id: '3',
      type: 'info',
      item: 'Revisão Geral',
      message: 'Revisão geral programada para daqui 2 meses',
      kmPrevista: 15000,
      dataPrevista: '2024-03-15',
      resolvido: false,
    },
  ]);

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, resolvido: true } : alert
      )
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return !alert.resolvido;
    return alert.type === filter && !alert.resolvido;
  });

  const urgentCount = alerts.filter((a) => a.type === 'urgent' && !a.resolvido).length;
  const warningCount = alerts.filter((a) => a.type === 'warning' && !a.resolvido).length;
  const infoCount = alerts.filter((a) => a.type === 'info' && !a.resolvido).length;

  return (
    <div className="min-h-screen axion-bg-pattern">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <ArrowLeft className="w-6 h-6 text-white" />
              <Bike className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">AxionRide</h1>
            </Link>
            <Bell className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Alertas de Manutenção</h2>
          <p className="text-gray-400">Acompanhe os alertas da sua moto</p>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="axion-card bg-red-500/10 border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Urgentes</p>
                <p className="text-3xl font-bold text-red-400">{urgentCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="axion-card bg-yellow-500/10 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Atenção</p>
                <p className="text-3xl font-bold text-yellow-400">{warningCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="axion-card bg-blue-500/10 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Avisos</p>
                <p className="text-3xl font-bold text-blue-400">{infoCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="axion-card-solid mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Filtrar:</span>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={filter === 'urgent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('urgent')}
              className={filter === 'urgent' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              Urgentes
            </Button>
            <Button
              variant={filter === 'warning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('warning')}
              className={filter === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
            >
              Atenção
            </Button>
            <Button
              variant={filter === 'info' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('info')}
              className={filter === 'info' ? 'bg-blue-500 hover:bg-blue-600' : ''}
            >
              Avisos
            </Button>
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="axion-card-solid text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Nenhum alerta ativo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sua moto está em dia com a manutenção!
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className="axion-card-solid animate-slide-up">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {alert.item}
                      </h3>
                      <StatusIndicator
                        status={alert.type === 'urgent' ? 'danger' : alert.type === 'warning' ? 'warning' : 'good'}
                        label={alert.type === 'urgent' ? 'URGENTE' : alert.type === 'warning' ? 'ATENÇÃO' : 'AVISO'}
                      />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{alert.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>KM: {alert.kmPrevista.toLocaleString('pt-BR')}</span>
                      <span>•</span>
                      <span>Data: {new Date(alert.dataPrevista).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleResolve(alert.id)}
                    variant="outline"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolver
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
