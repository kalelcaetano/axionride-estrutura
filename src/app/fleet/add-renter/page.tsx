'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateId } from '@/lib/fleet-utils';
import type { Renter } from '@/lib/types';

export default function AddRenterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cnh: '',
    canEditMaintenance: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone) newErrors.phone = 'Telefone é obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Criar novo locatário
    const fleetOwnerId = 'admin-user-id'; // TODO: Pegar do contexto de autenticação
    
    const newRenter: Renter = {
      id: generateId(),
      fleetOwnerId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      cpf: formData.cpf || undefined,
      cnh: formData.cnh || undefined,
      status: 'active',
      canEditMaintenance: formData.canEditMaintenance,
      createdAt: new Date(),
    };

    // Salvar no localStorage
    const storedRenters = localStorage.getItem('fleetRenters');
    const renters = storedRenters ? JSON.parse(storedRenters) : [];
    renters.push(newRenter);
    localStorage.setItem('fleetRenters', JSON.stringify(renters));

    // Redirecionar para gerenciar locatários
    router.push('/fleet/manage-renters');
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
              <h1 className="text-2xl font-bold text-white">Adicionar Locatário</h1>
              <p className="text-sm text-purple-300">Cadastre um novo motorista na frota</p>
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
                <UserPlus className="w-12 h-12 text-white" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <Label htmlFor="name" className="text-white mb-2 block">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João Silva"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email e Telefone */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email" className="text-white mb-2 block">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@email.com"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white mb-2 block">
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* CPF e CNH */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cpf" className="text-white mb-2 block">
                    CPF (opcional)
                  </Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <Label htmlFor="cnh" className="text-white mb-2 block">
                    CNH (opcional)
                  </Label>
                  <Input
                    id="cnh"
                    type="text"
                    value={formData.cnh}
                    onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                    placeholder="00000000000"
                    maxLength={11}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Permissões */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-bold mb-3">Permissões</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.canEditMaintenance}
                    onChange={(e) => setFormData({ ...formData, canEditMaintenance: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                  />
                  <div>
                    <p className="text-white">Pode editar histórico de manutenção</p>
                    <p className="text-gray-400 text-sm">
                      Permite que o locatário registre manutenções realizadas
                    </p>
                  </div>
                </label>
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
                  Salvar Locatário
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
