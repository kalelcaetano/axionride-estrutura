'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bike, ArrowLeft, ShoppingCart, Star, ExternalLink, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Part {
  id: string;
  nome: string;
  loja: string;
  preco: number;
  avaliacao: number;
  link: string;
  imagem?: string;
}

export default function PartsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');
  const [filterStore, setFilterStore] = useState<string>('all');

  const [parts] = useState<Part[]>([
    {
      id: '1',
      nome: 'Óleo Motul 5100 10W40',
      loja: 'Mercado Livre',
      preco: 89.90,
      avaliacao: 4.8,
      link: 'https://mercadolivre.com.br',
    },
    {
      id: '2',
      nome: 'Filtro de Óleo Tecfil',
      loja: 'Amazon',
      preco: 25.50,
      avaliacao: 4.5,
      link: 'https://amazon.com.br',
    },
    {
      id: '3',
      nome: 'Filtro de Ar K&N',
      loja: 'Shopee',
      preco: 120.00,
      avaliacao: 4.9,
      link: 'https://shopee.com.br',
    },
    {
      id: '4',
      nome: 'Kit Relação Vaz',
      loja: 'Mercado Livre',
      preco: 350.00,
      avaliacao: 4.7,
      link: 'https://mercadolivre.com.br',
    },
    {
      id: '5',
      nome: 'Pneu Michelin Pilot Street',
      loja: 'Amazon',
      preco: 280.00,
      avaliacao: 4.6,
      link: 'https://amazon.com.br',
    },
  ]);

  const stores = ['all', ...Array.from(new Set(parts.map((p) => p.loja)))];

  const filteredAndSortedParts = parts
    .filter((part) => {
      const matchesSearch = part.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStore = filterStore === 'all' || part.loja === filterStore;
      return matchesSearch && matchesStore;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.preco - b.preco;
      if (sortBy === 'price-desc') return b.preco - a.preco;
      return b.avaliacao - a.avaliacao;
    });

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Recomendações de Peças</h2>
          <p className="text-gray-400">Encontre as melhores peças para sua moto</p>
        </div>

        {/* Filtros e Busca */}
        <div className="axion-card-solid mb-6 space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar peças..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Ordenar por
              </label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Melhor Avaliação
                    </div>
                  </SelectItem>
                  <SelectItem value="price-asc">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Menor Preço
                    </div>
                  </SelectItem>
                  <SelectItem value="price-desc">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Maior Preço
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Filtrar por loja
              </label>
              <Select value={filterStore} onValueChange={setFilterStore}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as lojas</SelectItem>
                  {stores.filter((s) => s !== 'all').map((store) => (
                    <SelectItem key={store} value={store}>
                      {store}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid de Peças */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedParts.map((part) => (
            <div key={part.id} className="axion-card-solid hover:scale-105 transition-transform">
              {/* Imagem Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg mb-4 flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-cyan-400" />
              </div>

              {/* Informações */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                    {part.nome}
                  </h3>
                  <p className="text-sm text-gray-500">{part.loja}</p>
                </div>

                {/* Avaliação */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(part.avaliacao)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {part.avaliacao.toFixed(1)}
                  </span>
                </div>

                {/* Preço */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Preço</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      R$ {part.preco.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    className="axion-gradient-primary text-white"
                    onClick={() => window.open(part.link, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedParts.length === 0 && (
          <div className="axion-card-solid text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Nenhuma peça encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tente ajustar os filtros de busca
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
