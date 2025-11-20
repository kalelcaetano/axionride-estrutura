'use client';

import Link from 'next/link';
import { Bike, Shield, Zap, Bell, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo e Título */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Bike className="w-12 h-12 text-cyan-400" />
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                AxionRide
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-cyan-300 font-light">
              Manutenção Inteligente para sua Moto
            </p>
          </div>

          {/* Descrição */}
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
            Acompanhamento automático de quilômetros, alertas preventivos e gestão completa 
            da manutenção da sua moto. Tudo em um só lugar.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg">
                Começar Agora
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 px-8 py-6 text-lg">
                Fazer Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Manutenção Preventiva"
            description="Alertas inteligentes baseados no manual da sua moto"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Acompanhamento Automático"
            description="Registre quilômetros manualmente ou via GPS"
          />
          <FeatureCard
            icon={<Bell className="w-8 h-8" />}
            title="Alertas em Tempo Real"
            description="Notificações de desgaste, revisões e peças"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Relatórios Completos"
            description="Análise de custos, ganhos e desempenho"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Gestão de Frota"
            description="Controle múltiplas motos e motoristas"
          />
          <FeatureCard
            icon={<Bike className="w-8 h-8" />}
            title="Três Modos de Uso"
            description="Motoboy, Pessoal ou Frota - você escolhe"
          />
        </div>

        {/* Modos de Uso */}
        <div className="mt-20 space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            Escolha seu Modo de Uso
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ModeCard
              title="Motoboy"
              description="Controle de ganhos vs. desgaste para profissionais"
              gradient="from-orange-500 to-red-600"
            />
            <ModeCard
              title="Uso Pessoal"
              description="Histórico completo e agenda de manutenção"
              gradient="from-blue-500 to-cyan-600"
            />
            <ModeCard
              title="Frota"
              description="Gestão completa para locadoras de motos"
              gradient="from-purple-500 to-pink-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="text-cyan-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function ModeCard({ title, description, gradient }: { title: string; description: string; gradient: string }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white hover:scale-105 transition-transform duration-300`}>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-white/90">{description}</p>
    </div>
  );
}
