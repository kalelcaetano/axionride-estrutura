'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bike, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Salvar token e informações do usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userMode', data.user.tipo_usuario);

      // Redirecionar baseado no tipo de usuário
      if (data.user.tipo_usuario === 'frota_admin') {
        router.push('/fleet');
      } else if (data.user.tipo_usuario === 'locatario') {
        router.push('/renter/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen axion-bg-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <Bike className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">AxionRide</h1>
          </Link>
          <p className="text-gray-400">Entre na sua conta</p>
        </div>

        {/* Card de Login */}
        <div className="axion-card-solid animate-slide-up">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Erro */}
            {error && (
              <div className="axion-alert-urgent flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Senha */}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Esqueci a senha */}
            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-cyan-500 hover:text-cyan-400 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              className="w-full axion-gradient-primary hover:opacity-90 text-white"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                'Entrando...'
              ) : (
                <>
                  Entrar
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
                Não tem uma conta?
              </span>
            </div>
          </div>

          {/* Link para Cadastro */}
          <Link href="/auth/register">
            <Button variant="outline" className="w-full" size="lg">
              Criar conta grátis
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
