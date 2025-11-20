'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bike, ArrowLeft, Upload, FileText, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertBanner } from '@/components/custom/alert-banner';

interface MaintenanceRule {
  id: string;
  item: string;
  intervalo_km: number;
  intervalo_tempo_dias: number;
}

export default function ManualPage() {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [rules, setRules] = useState<MaintenanceRule[]>([
    { id: '1', item: 'Óleo', intervalo_km: 5000, intervalo_tempo_dias: 180 },
    { id: '2', item: 'Filtro de Óleo', intervalo_km: 5000, intervalo_tempo_dias: 180 },
    { id: '3', item: 'Filtro de Ar', intervalo_km: 10000, intervalo_tempo_dias: 365 },
    { id: '4', item: 'Kit Relação', intervalo_km: 20000, intervalo_tempo_dias: 730 },
    { id: '5', item: 'Fluido de Freio', intervalo_km: 15000, intervalo_tempo_dias: 365 },
    { id: '6', item: 'Fluido de Arrefecimento', intervalo_km: 20000, intervalo_tempo_dias: 730 },
    { id: '7', item: 'Velas', intervalo_km: 10000, intervalo_tempo_dias: 365 },
    { id: '8', item: 'Pneus', intervalo_km: 15000, intervalo_tempo_dias: 730 },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({ item: '', intervalo_km: 0, intervalo_tempo_dias: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simular upload
      setTimeout(() => {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      }, 1000);
    }
  };

  const handleAddRule = () => {
    if (newRule.item && newRule.intervalo_km > 0) {
      setRules([
        ...rules,
        {
          id: Date.now().toString(),
          ...newRule,
        },
      ]);
      setNewRule({ item: '', intervalo_km: 0, intervalo_tempo_dias: 0 });
    }
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const handleSaveRules = async () => {
    // Salvar no backend
    alert('Regras salvas com sucesso!');
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
            <Button onClick={handleSaveRules} className="axion-gradient-primary text-white">
              <Save className="w-5 h-5 mr-2" />
              Salvar Regras
            </Button>
          </div>
        </div>
      </nav>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Manual da Moto</h2>
          <p className="text-gray-400">Configure as regras de manutenção da sua moto</p>
        </div>

        {uploadSuccess && (
          <div className="mb-6 animate-slide-up">
            <AlertBanner type="success" message="Manual enviado com sucesso!" />
          </div>
        )}

        {/* Upload do Manual */}
        <div className="axion-card-solid mb-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Upload do Manual
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Envie o manual da sua moto em PDF ou imagem para extrair automaticamente as regras de manutenção
          </p>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <label htmlFor="manual-upload" className="cursor-pointer">
              <span className="text-cyan-500 hover:text-cyan-400 font-medium">
                Clique para fazer upload
              </span>
              <span className="text-gray-600 dark:text-gray-400"> ou arraste o arquivo aqui</span>
              <input
                id="manual-upload"
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">PDF, JPG ou PNG (máx. 10MB)</p>
          </div>
        </div>

        {/* Regras de Manutenção */}
        <div className="axion-card-solid mb-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Regras de Manutenção
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Configure os intervalos de manutenção por quilometragem e tempo
          </p>

          {/* Lista de Regras */}
          <div className="space-y-4 mb-6">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1 grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Item</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{rule.item}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Intervalo (km)</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {rule.intervalo_km.toLocaleString('pt-BR')} km
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Intervalo (tempo)</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {Math.floor(rule.intervalo_tempo_dias / 30)} meses
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(rule.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Adicionar Nova Regra */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
              Adicionar Nova Regra
            </h4>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Item</Label>
                <Input
                  type="text"
                  placeholder="Ex: Corrente"
                  value={newRule.item}
                  onChange={(e) => setNewRule({ ...newRule, item: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Intervalo (km)</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={newRule.intervalo_km || ''}
                  onChange={(e) =>
                    setNewRule({ ...newRule, intervalo_km: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Intervalo (dias)</Label>
                <Input
                  type="number"
                  placeholder="180"
                  value={newRule.intervalo_tempo_dias || ''}
                  onChange={(e) =>
                    setNewRule({ ...newRule, intervalo_tempo_dias: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <Button onClick={handleAddRule} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Regra
            </Button>
          </div>
        </div>

        {/* Informação */}
        <div className="axion-alert-info">
          <p className="text-sm">
            <strong>Dica:</strong> As regras configuradas aqui serão usadas para gerar alertas automáticos
            de manutenção baseados na quilometragem e no tempo decorrido.
          </p>
        </div>
      </div>
    </div>
  );
}
