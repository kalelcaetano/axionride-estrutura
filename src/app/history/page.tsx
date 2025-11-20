'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bike, ArrowLeft, History, Filter, Calendar, Wrench, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MaintenanceRecord {
  id: string;
  data: string;
  km: number;
  itens: string[];
  descricao: string;
  custo?: number;
  mecanico?: string;
}

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [records] = useState<MaintenanceRecord[]>([
    {
      id: '1',
      data: '2024-01-15',
      km: 5000,
      itens: ['Óleo', 'Filtro de Óleo'],
      descricao: 'Troca de óleo e filtro',
      custo: 150,
      mecanico: 'João Silva',
    },
    {
      id: '2',
      data: '2023-12-10',
      km: 4500,
      itens: ['Filtro de Ar'],
      descricao: 'Substituição do filtro de ar',
      custo: 80,
      mecanico: 'João Silva',
    },
    {
      id: '3',
      data: '2023-11-05',
      km: 4000,
      itens: ['Pneus', 'Balanceamento'],
      descricao: 'Troca de pneus dianteiro e traseiro',
      custo: 600,
      mecanico: 'Maria Santos',
    },
  ]);

  const filteredRecords = records.filter((record) =>
    record.itens.some((item) => item.toLowerCase().includes(searchTerm.toLowerCase())) ||
    record.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCost = records.reduce((sum, record) => sum + (record.custo || 0), 0);

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
            <Button className="axion-gradient-primary text-white">
              <Plus className="w-5 h-5 mr-2" />
              Nova Manutenção
            </Button>
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Histórico de Manutenção</h2>
          <p className="text-gray-400">Acompanhe todas as manutenções realizadas</p>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="axion-card bg-purple-500/10 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total de Manutenções</p>
                <p className="text-3xl font-bold text-purple-400">{records.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="axion-card bg-green-500/10 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Custo Total</p>
                <p className="text-3xl font-bold text-green-400">
                  R$ {totalCost.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="axion-card bg-cyan-500/10 border-cyan-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Última Manutenção</p>
                <p className="text-lg font-bold text-cyan-400">
                  {new Date(records[0]?.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="axion-card-solid mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por item ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Timeline de Manutenções */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="axion-card-solid text-center py-12">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tente ajustar os filtros de busca
              </p>
            </div>
          ) : (
            filteredRecords.map((record, index) => (
              <div key={record.id} className="axion-card-solid animate-slide-up relative">
                {/* Linha de Timeline */}
                {index !== filteredRecords.length - 1 && (
                  <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 to-transparent"></div>
                )}

                <div className="flex gap-4">
                  {/* Ícone */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                          {record.descricao}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(record.data).toLocaleDateString('pt-BR')}
                          </span>
                          <span>•</span>
                          <span>{record.km.toLocaleString('pt-BR')} km</span>
                        </div>
                      </div>
                      {record.custo && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Custo</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            R$ {record.custo.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Itens Trocados */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {record.itens.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full text-sm font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    {/* Mecânico */}
                    {record.mecanico && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mecânico: <span className="font-medium">{record.mecanico}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
