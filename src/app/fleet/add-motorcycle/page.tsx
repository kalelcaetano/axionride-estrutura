'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MOTORCYCLE_BRANDS } from '@/lib/constants';
import { generateId, formatPlate, validatePlate, calculateMaintenanceStatus } from '@/lib/fleet-utils';
import type { FleetMotorcycle } from '@/lib/types';

export default function AddMotorcyclePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate: '',
    currentKm: 0,
    status: 'available' as const,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    const newErrors: Record<string, string> = {};
    
    if (!formData.brand) newErrors.brand = 'Marca é obrigatória';
    if (!formData.model) newErrors.model = 'Modelo é obrigatório';
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Ano inválido';
    }
    if (!formData.plate) {
      newErrors.plate = 'Placa é obrigatória';
    } else if (!validatePlate(formData.plate)) {
      newErrors.plate = 'Placa inválida (use formato ABC-1234 ou ABC1D23)';
    }
    if (formData.currentKm < 0) newErrors.currentKm = 'Quilometragem não pode ser negativa';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Criar nova moto
    const userId = 'admin-user-id'; // TODO: Pegar do contexto de autenticação
    const nextMaintenanceKm = formData.currentKm + 3000; // Próxima manutenção em 3000km
    
    const newMotorcycle: FleetMotorcycle = {
      id: generateId(),
      userId,
      fleetOwnerId: userId,
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      plate: formatPlate(formData.plate),
      currentKm: formData.currentKm,
      lastMaintenanceKm: formData.currentKm,
      nextMaintenanceKm,
      status: formData.status,
      maintenanceStatus: calculateMaintenanceStatus(formData.currentKm, nextMaintenanceKm),
      totalKm: formData.currentKm,
      maintenanceCost: 0,
      createdAt: new Date(),
    };

    // Salvar no localStorage
    const storedMotorcycles = localStorage.getItem('fleetMotorcycles');
    const motorcycles = storedMotorcycles ? JSON.parse(storedMotorcycles) : [];
    motorcycles.push(newMotorcycle);
    localStorage.setItem('fleetMotorcycles', JSON.stringify(motorcycles));

    // Redirecionar para dashboard
    router.push('/fleet');
  };

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
              <h1 className="text-2xl font-bold text-white">Adicionar Moto</h1>
              <p className="text-sm text-purple-300">Cadastre uma nova moto na frota</p>
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
                <Bike className="w-12 h-12 text-white" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Marca */}
              <div>
                <Label htmlFor="brand" className="text-white mb-2 block">
                  Marca *
                </Label>
                <select
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" className="bg-slate-900">Selecione a marca</option>
                  {MOTORCYCLE_BRANDS.map((brand) => (
                    <option key={brand} value={brand} className="bg-slate-900">
                      {brand}
                    </option>
                  ))}
                </select>
                {errors.brand && (
                  <p className="text-red-400 text-sm mt-1">{errors.brand}</p>
                )}
              </div>

              {/* Modelo */}
              <div>
                <Label htmlFor="model" className="text-white mb-2 block">
                  Modelo *
                </Label>
                <Input
                  id="model"
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Ex: CG 160, XRE 300, MT-03"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
                {errors.model && (
                  <p className="text-red-400 text-sm mt-1">{errors.model}</p>
                )}
              </div>

              {/* Ano e Placa */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="year" className="text-white mb-2 block">
                    Ano *
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="bg-white/5 border-white/20 text-white"
                  />
                  {errors.year && (
                    <p className="text-red-400 text-sm mt-1">{errors.year}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="plate" className="text-white mb-2 block">
                    Placa *
                  </Label>
                  <Input
                    id="plate"
                    type="text"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    placeholder="ABC-1234 ou ABC1D23"
                    maxLength={8}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  />
                  {errors.plate && (
                    <p className="text-red-400 text-sm mt-1">{errors.plate}</p>
                  )}
                </div>
              </div>

              {/* Quilometragem Atual */}
              <div>
                <Label htmlFor="currentKm" className="text-white mb-2 block">
                  Quilometragem Atual *
                </Label>
                <Input
                  id="currentKm"
                  type="number"
                  value={formData.currentKm}
                  onChange={(e) => setFormData({ ...formData, currentKm: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="0"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
                {errors.currentKm && (
                  <p className="text-red-400 text-sm mt-1">{errors.currentKm}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" className="text-white mb-2 block">
                  Status Inicial
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="available" className="bg-slate-900">Disponível</option>
                  <option value="in_use" className="bg-slate-900">Em Uso</option>
                  <option value="maintenance" className="bg-slate-900">Em Manutenção</option>
                  <option value="inactive" className="bg-slate-900">Inativa</option>
                </select>
              </div>

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
                >
                  <Save className="w-5 h-5 mr-2" />
                  Salvar Moto
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
