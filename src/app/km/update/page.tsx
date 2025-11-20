'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bike, ArrowLeft, MapPin, Save, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertBanner } from '@/components/custom/alert-banner';

export default function UpdateKmPage() {
  const router = useRouter();
  const [km, setKm] = useState(0);
  const [previousKm] = useState(0); // Virá do backend
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateKm = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/km/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          moto_id: localStorage.getItem('selectedMotorcycleId'),
          km_nova: km,
          tipo_atualizacao: 'manual',
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Erro ao atualizar km:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGpsUpdate = () => {
    // Implementar lógica de GPS
    alert('Funcionalidade GPS em desenvolvimento');
  };

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
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Atualizar Quilometragem</h2>
          <p className="text-gray-400">Mantenha o controle preciso da sua moto</p>
        </div>

        {success && (
          <div className="mb-6 animate-slide-up">
            <AlertBanner
              type="success"
              message="Quilometragem atualizada com sucesso!"
            />
          </div>
        )}

        <div className="axion-card-solid space-y-8">
          {/* Informações Atuais */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">KM Anterior</p>
              <p className="text-2xl font-bold text-white">{previousKm.toLocaleString('pt-BR')} km</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Última Atualização</p>
              <p className="text-lg font-semibold text-white">Hoje</p>
            </div>
          </div>

          {/* Slider de KM */}
          <div className="space-y-4">
            <Label className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
              Nova Quilometragem
            </Label>
            <div className="space-y-6">
              <Slider
                value={[km]}
                onValueChange={(value) => setKm(value[0])}
                max={200000}
                step={100}
                className="w-full"
              />
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={km}
                  onChange={(e) => setKm(Number(e.target.value))}
                  className="text-2xl font-bold text-center"
                  min={previousKm}
                />
                <span className="text-gray-400 text-lg">km</span>
              </div>
            </div>
          </div>

          {/* Diferença */}
          {km > previousKm && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Diferença</p>
                <p className="text-xl font-bold text-blue-400">
                  +{(km - previousKm).toLocaleString('pt-BR')} km
                </p>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="space-y-3">
            <Button
              onClick={handleUpdateKm}
              disabled={loading || km <= previousKm}
              className="w-full axion-gradient-primary hover:opacity-90 text-white"
              size="lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Quilometragem'}
            </Button>

            <Button
              onClick={handleGpsUpdate}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Atualizar via GPS
            </Button>
          </div>

          {/* Informação */}
          <div className="text-center text-sm text-gray-500">
            <p>A quilometragem será sincronizada automaticamente</p>
            <p>com o modo frota, se aplicável</p>
          </div>
        </div>
      </div>
    </div>
  );
}
