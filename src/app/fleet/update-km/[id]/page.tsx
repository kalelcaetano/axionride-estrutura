'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateMaintenanceStatus } from '@/lib/fleet-utils';
import type { FleetMotorcycle } from '@/lib/types';

export default function UpdateKmPage() {
  const router = useRouter();
  const params = useParams();
  const motorcycleId = params.id as string;
  
  const [motorcycle, setMotorcycle] = useState<FleetMotorcycle | null>(null);
  const [newKm, setNewKm] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMotorcycle();
  }, [motorcycleId]);

  const loadMotorcycle = () => {
    const storedMotorcycles = localStorage.getItem('fleetMotorcycles');
    if (storedMotorcycles) {
      const motorcycles: FleetMotorcycle[] = JSON.parse(storedMotorcycles);
      const found = motorcycles.find(m => m.id === motorcycleId);
      if (found) {
        setMotorcycle(found);
        setNewKm(found.currentKm);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motorcycle) return;

    // Validações
    if (newKm < motorcycle.currentKm) {
      setError('A nova quilometragem não pode ser menor que a atual');
      return;
    }

    if (newKm === motorcycle.currentKm) {
      setError('A quilometragem não foi alterada');
      return;
    }

    // Atualizar moto
    const storedMotorcycles = localStorage.getItem('fleetMotorcycles');
    if (storedMotorcycles) {
      const motorcycles: FleetMotorcycle[] = JSON.parse(storedMotorcycles);
      const updatedMotorcycles = motorcycles.map(m => {
        if (m.id === motorcycleId) {
          const updatedMoto = {
            ...m,
            currentKm: newKm,
            totalKm: m.totalKm + (newKm - m.currentKm),
            maintenanceStatus: calculateMaintenanceStatus(newKm, m.nextMaintenanceKm),
          };
          return updatedMoto;
        }
        return m;
      });
      
      localStorage.setItem('fleetMotorcycles', JSON.stringify(updatedMotorcycles));
      
      // TODO: Criar notificação de sincronização para o administrador
      
      router.push(`/fleet/motorcycle/${motorcycleId}`);
    }
  };

  if (!motorcycle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  const kmDifference = newKm - motorcycle.currentKm;
  const newMaintenanceStatus = calculateMaintenanceStatus(newKm, motorcycle.nextMaintenanceKm);

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
              <h1 className="text-2xl font-bold text-white">Atualizar Quilometragem</h1>
              <p className="text-sm text-purple-300">
                {motorcycle.brand} {motorcycle.model} - {motorcycle.plate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-full p-4">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Informações Atuais */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <h3 className="text-white font-bold mb-4">Informações Atuais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Quilometragem Atual</p>
                  <p className="text-white text-2xl font-bold">
                    {motorcycle.currentKm.toLocaleString('pt-BR')} km
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Próxima Manutenção</p>
                  <p className="text-white text-2xl font-bold">
                    {motorcycle.nextMaintenanceKm.toLocaleString('pt-BR')} km
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nova Quilometragem */}
              <div>
                <Label htmlFor="newKm" className="text-white mb-2 block">
                  Nova Quilometragem *
                </Label>
                <Input
                  id="newKm"
                  type="number"
                  value={newKm}
                  onChange={(e) => {
                    setNewKm(parseInt(e.target.value) || 0);
                    setError('');
                  }}
                  min={motorcycle.currentKm}
                  className="bg-white/5 border-white/20 text-white text-2xl font-bold"
                />
                {error && (
                  <p className="text-red-400 text-sm mt-1">{error}</p>
                )}
              </div>

              {/* Resumo da Atualização */}
              {kmDifference > 0 && (
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-white font-bold mb-4">Resumo da Atualização</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Quilômetros Rodados</span>
                      <span className="text-white font-bold">
                        +{kmDifference.toLocaleString('pt-BR')} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Faltam para Manutenção</span>
                      <span className="text-white font-bold">
                        {Math.max(0, motorcycle.nextMaintenanceKm - newKm).toLocaleString('pt-BR')} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Novo Status</span>
                      <span className={`font-bold ${
                        newMaintenanceStatus === 'ok' ? 'text-green-400' :
                        newMaintenanceStatus === 'attention' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {newMaintenanceStatus === 'ok' ? 'Em Dia' :
                         newMaintenanceStatus === 'attention' ? 'Atenção' :
                         'Urgente'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  disabled={kmDifference <= 0}
                >
                  <Save className="w-5 h-5 mr-2" />
                  Atualizar Quilometragem
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
