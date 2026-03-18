'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Gavel, 
  ShoppingCart, 
  FileText, 
  CreditCard, 
  CheckCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Entidades', icon: Users, href: '/entities' },
  { name: 'Presupuestos', icon: Receipt, href: '/budgets' },
  { name: 'Licitaciones', icon: Gavel, href: '/tenders' },
  { name: 'OCs', icon: ShoppingCart, href: '/purchase-orders' },
  { name: 'Facturas', icon: FileText, href: '/invoices' },
  { name: 'Pagos', icon: CreditCard, href: '/payments' },
  { name: 'Aprobaciones', icon: CheckCircle, href: '/approvals' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  if (pathname === '/login') return null;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
          ENOLA
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-blue-600/10 text-blue-400 shadow-sm border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
