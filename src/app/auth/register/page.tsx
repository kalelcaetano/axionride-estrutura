'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bike, Mail, Lock, User, ArrowRight, AlertCircle, Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const USER_TYPES = [
  { value: 'motoboy', label: 'Motoboy', description: 'Controle de ganhos vs. desgaste', price: 'R$ 30/mês' },
  { value: 'viajante', label: 'Viajante', description: 'Para quem viaja muito', price: 'R$ 30/mês' },
  { value: 'casa_trabalho', label: 'Casa-Trabalho', description: 'Uso diário moderado', price: 'R$ 20/mês' },
  { value: 'premium', label: 'Premium', description: 'Recursos avançados', price: 'R$ 40/mês' },
  { value: 'frota_admin', label: 'Frota (Administrador)', description: 'Gestão de múltiplas motos', price: 'Sob consulta' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipo_usuario: '',
  });
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'TAVARES160') {
      setCouponApplied(true);
      setError('');
    } else {
      setError('Cupom inválido');
      setCouponApplied(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!formData.tipo_usuario) {
      setError('Selecione um tipo de usuário');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cupom_usado: couponApplied,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      // Salvar token e informações do usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userMode', data.user.tipo_usuario);

      // Redirecionar baseado no tipo de usuário
      if (data.user.tipo_usuario === 'frota_admin') {
        router.push('/fleet');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen axion-bg-pattern flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <Bike className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">AxionRide</h1>
          </Link>
          <p className="text-gray-400">Crie sua conta e comece agora</p>
        </div>

        {/* Card de Cadastro */}
        <div className="axion-card-solid animate-slide-up">
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Erro */}
            {error && (
              <div className="axion-alert-urgent flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-gray-700 dark:text-gray-300">
                Nome Completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Usuário */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">
                Tipo de Conta
              </Label>
              <Select value={formData.tipo_usuario} onValueChange={(value) => handleChange('tipo_usuario', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  {USER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-gray-500">{type.description} - {type.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cupom */}
            <div className="space-y-2">
              {!showCoupon ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCoupon(true)}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Tenho um cupom de desconto
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Cupom de Desconto
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="TAVARES160"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      disabled={couponApplied}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponApplied || !coupon}
                      variant={couponApplied ? 'default' : 'outline'}
                    >
                      {couponApplied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Aplicado
                        </>
                      ) : (
                        'Aplicar'
                      )}
                    </Button>
                  </div>
                  {couponApplied && (
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Cupom aplicado! Desconto de R$ 10 no primeiro mês
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Botão de Cadastro */}
            <Button
              type="submit"
              className="w-full axion-gradient-primary hover:opacity-90 text-white"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                'Criando conta...'
              ) : (
                <>
                  Criar Conta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-gray-500">
                Já tem uma conta?
              </span>
            </div>
          </div>

          {/* Link para Login */}
          <Link href="/auth/login">
            <Button variant="outline" className="w-full" size="lg">
              Fazer Login
            </Button>
          </Link>
        </div>

        {/* Link para Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
