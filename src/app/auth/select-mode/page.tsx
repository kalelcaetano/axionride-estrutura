'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bike, User, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { USER_MODES } from '@/lib/constants';
import type { UserMode } from '@/lib/types';

export default function SelectModePage() {
  const router = useRouter();

  const handleSelectMode = (mode: UserMode) => {
    // TODO: Salvar modo selecionado no backend
    localStorage.setItem('userMode', mode);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <Bike className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">AxionRide</h1>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-3">
            Como você vai usar o AxionRide?
          </h2>
          <p className="text-gray-400 text-lg">
            Escolha o modo que melhor se adapta às suas necessidades
          </p>
        </div>

        {/* Cards de Modos */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Modo Motoboy */}
          <ModeCard
            mode="motoboy"
            icon={<Bike className="w-12 h-12" />}
            title={USER_MODES.motoboy.name}
            description={USER_MODES.motoboy.description}
            features={USER_MODES.motoboy.features}
            gradient={USER_MODES.motoboy.color}
            onSelect={() => handleSelectMode('motoboy')}
          />

          {/* Modo Pessoal */}
          <ModeCard
            mode="personal"
            icon={<User className="w-12 h-12" />}
            title={USER_MODES.personal.name}
            description={USER_MODES.personal.description}
            features={USER_MODES.personal.features}
            gradient={USER_MODES.personal.color}
            onSelect={() => handleSelectMode('personal')}
          />

          {/* Modo Frota */}
          <ModeCard
            mode="fleet"
            icon={<Building2 className="w-12 h-12" />}
            title={USER_MODES.fleet.name}
            description={USER_MODES.fleet.description}
            features={USER_MODES.fleet.features}
            gradient={USER_MODES.fleet.color}
            onSelect={() => handleSelectMode('fleet')}
          />
        </div>

        {/* Nota */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Você poderá alterar o modo de uso a qualquer momento nas configurações
          </p>
        </div>
      </div>
    </div>
  );
}

interface ModeCardProps {
  mode: UserMode;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: readonly string[];
  gradient: string;
  onSelect: () => void;
}

function ModeCard({ icon, title, description, features, gradient, onSelect }: ModeCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 mb-4 flex items-center justify-center`}>
        <div className="text-white">{icon}</div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>

        {/* Features */}
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
              <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botão */}
      <Button
        onClick={onSelect}
        className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white py-6`}
      >
        Selecionar
      </Button>
    </div>
  );
}
