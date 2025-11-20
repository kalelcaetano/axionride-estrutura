'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Lock, Unlock, DollarSign, Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { calculateFleetPlan, formatCurrency } from '@/lib/fleet-utils';
import { FLEET_CONFIG } from '@/lib/constants';

export default function FleetSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    autoLockMaintenance: false,
    allowRenterKmUpdate: true,
    notifyOnKmUpdate: true,
    notifyOnNewAlert: true,
  });

  // Calcular estatísticas do plano
  const storedMotorcycles = localStorage.getItem('fleetMotorcycles');
  const motorcycles = storedMotorcycles ? JSON.parse(storedMotorcycles) : [];
  const fleetPlan = calculateFleetPlan(motorcycles.length);

  const handleSave = () => {
    localStorage.setItem('fleetSettings', JSON.stringify(settings));
    alert('Configurações salvas com sucesso!');
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
              <h1 className="text-2xl font-bold text-white">Configurações da Frota</h1>
              <p className="text-sm text-purple-300">Gerencie as configurações do modo frota</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Plano da Frota */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Plano da Frota</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-purple-100 text-sm mb-1">Motos Incluídas</p>
                <p className="text-3xl font-bold">{fleetPlan.baseMotorcycles}</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm mb-1">Motos Cadastradas</p>
                <p className="text-3xl font-bold">{fleetPlan.currentMotorcycles}</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm mb-1">Motos Extras</p>
                <p className="text-3xl font-bold">{fleetPlan.extraMotorcycles}</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm mb-1">Custo Extra/Ano</p>
                <p className="text-3xl font-bold">{formatCurrency(fleetPlan.annualExtraCost)}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-purple-100 text-sm">
                Você tem {fleetPlan.extraMotorcycles} moto(s) extra(s) além do plano base. 
                Cada moto extra custa {formatCurrency(FLEET_CONFIG.EXTRA_MOTORCYCLE_COST)} por ano.
              </p>
            </div>
          </div>

          {/* Permissões e Controles */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Permissões e Controles</h2>
            <div className="space-y-6">
              {/* Bloqueio Automático de Manutenção */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {settings.autoLockMaintenance ? (
                      <Lock className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Unlock className="w-5 h-5 text-gray-400" />
                    )}
                    <Label className="text-white font-bold">
                      Bloquear Edição de Histórico de Manutenção
                    </Label>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Quando ativado, apenas o administrador pode editar o histórico de manutenção das motos
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoLockMaintenance}
                    onChange={(e) => setSettings({ ...settings, autoLockMaintenance: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Permitir Atualização de KM */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bike className="w-5 h-5 text-purple-400" />
                    <Label className="text-white font-bold">
                      Permitir Locatários Atualizarem Quilometragem
                    </Label>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Locatários podem atualizar a quilometragem das motos que estão usando
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowRenterKmUpdate}
                    onChange={(e) => setSettings({ ...settings, allowRenterKmUpdate: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Notificações de Sincronização</h2>
            <div className="space-y-6">
              {/* Notificar em Atualização de KM */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Label className="text-white font-bold mb-2 block">
                    Notificar ao Atualizar Quilometragem
                  </Label>
                  <p className="text-gray-400 text-sm">
                    Receba notificação quando um locatário atualizar a quilometragem
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnKmUpdate}
                    onChange={(e) => setSettings({ ...settings, notifyOnKmUpdate: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Notificar em Novo Alerta */}
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <Label className="text-white font-bold mb-2 block">
                    Notificar em Novos Alertas
                  </Label>
                  <p className="text-gray-400 text-sm">
                    Receba notificação quando houver novos alertas de manutenção
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnNewAlert}
                    onChange={(e) => setSettings({ ...settings, notifyOnNewAlert: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
