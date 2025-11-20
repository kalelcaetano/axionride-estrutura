'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bike, LayoutDashboard, Users, Settings, DollarSign, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FleetSidebarProps {
  onLogout?: () => void;
}

export function FleetSidebar({ onLogout }: FleetSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/fleet', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/fleet/motorcycles', icon: Bike, label: 'Motos' },
    { href: '/fleet/manage-renters', icon: Users, label: 'Locatários' },
    { href: '/fleet/financial', icon: DollarSign, label: 'Financeiro' },
    { href: '/fleet/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <Link href="/fleet" className="flex items-center gap-3">
          <Bike className="w-8 h-8 text-cyan-500" />
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">AxionRide</h1>
            <p className="text-xs text-gray-500">Modo Frota</p>
          </div>
        </Link>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
