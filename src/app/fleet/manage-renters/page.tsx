'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Renter, FleetMotorcycle } from '@/lib/types';

export default function ManageRentersPage() {
  const router = useRouter();
  const [renters, setRenters] = useState<Renter[]>([]);
  const [motorcycles, setMotorcycles] = useState<FleetMotorcycle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedRenters = localStorage.getItem('fleetRenters');
    const storedMotorcycles = localStorage.getItem('fleetMotorcycles');
    
    if (storedRenters) {
      setRenters(JSON.parse(storedRenters));
    }
    if (storedMotorcycles) {
      setMotorcycles(JSON.parse(storedMotorcycles));
    }
  };

  const filteredRenters = renters.filter(renter =>
    renter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    renter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    renter.phone.includes(searchTerm)
  );

  const getAssignedMotorcycle = (renterId: string) => {
    return motorcycles.find(m => m.currentRenterId === renterId);
  };

  const handleToggleStatus = (renterId: string) => {
    const updatedRenters = renters.map(renter => {
      if (renter.id === renterId) {
        return { ...renter, status: renter.status === 'active' ? 'inactive' : 'active' } as Renter;
      }
      return renter;
    });
    setRenters(updatedRenters);
    localStorage.setItem('fleetRenters', JSON.stringify(updatedRenters));
  };

  const handleDelete = (renterId: string) => {
    if (confirm('Tem certeza que deseja remover este locatário?')) {
      const updatedRenters = renters.filter(r => r.id !== renterId);
      setRenters(updatedRenters);
      localStorage.setItem('fleetRenters', JSON.stringify(updatedRenters));
    }
  };

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
                <h1 className="text-2xl font-bold text-white">Gerenciar Locatários</h1>
                <p className="text-sm text-purple-300">Controle os motoristas da sua frota</p>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              onClick={() => router.push('/fleet/add-renter')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Locatário
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Lista de Locatários */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          {filteredRenters.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">
                {searchTerm ? 'Nenhum locatário encontrado' : 'Nenhum locatário cadastrado ainda'}
              </p>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                onClick={() => router.push('/fleet/add-renter')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Primeiro Locatário
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRenters.map((renter) => {
                const assignedMoto = getAssignedMotorcycle(renter.id);
                return (
                  <RenterCard
                    key={renter.id}
                    renter={renter}
                    assignedMotorcycle={assignedMoto}
                    onToggleStatus={() => handleToggleStatus(renter.id)}
                    onEdit={() => router.push(`/fleet/edit-renter/${renter.id}`)}
                    onDelete={() => handleDelete(renter.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RenterCardProps {
  renter: Renter;
  assignedMotorcycle?: FleetMotorcycle;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function RenterCard({ renter, assignedMotorcycle, onToggleStatus, onEdit, onDelete }: RenterCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`rounded-full p-3 ${renter.status === 'active' ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
            {renter.status === 'active' ? (
              <UserCheck className="w-6 h-6 text-green-400" />
            ) : (
              <UserX className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h4 className="text-white font-bold">{renter.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs ${
                renter.status === 'active' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {renter.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>{renter.email}</span>
              <span>{renter.phone}</span>
              {renter.cpf && <span>CPF: {renter.cpf}</span>}
            </div>
            {assignedMotorcycle && (
              <div className="mt-2 text-sm">
                <span className="text-purple-400">
                  Moto: {assignedMotorcycle.brand} {assignedMotorcycle.model} ({assignedMotorcycle.plate})
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            onClick={onToggleStatus}
          >
            {renter.status === 'active' ? 'Desativar' : 'Ativar'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={onEdit}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
