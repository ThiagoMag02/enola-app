'use client';

import { useState, useEffect } from 'react';
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
  Wallet,
  LogOut,
  ChevronDown,
  ChevronRight,
  BadgeDollarSign,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  name: string;
  icon: any;
  href?: string;
  children?: { name: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Entidades', icon: Users, href: '/entities' },
  { 
    name: 'Ventas', 
    icon: BadgeDollarSign, 
    children: [
      { name: 'Presupuestos', href: '/budgets' },
      { name: 'Licitaciones', href: '/tenders' },
      { name: 'OCs', href: '/purchase-orders' },
      { name: 'Facturas', href: '/invoices' },
      { name: 'Pagos', href: '/payments' },
    ]
  },
  { 
    name: 'Recursos Humanos', 
    icon: Briefcase, 
    children: [
      { name: 'Nómina de Personal', href: '/human-resources/personnel' },
      { name: 'Empresa', href: '/human-resources/company' },
    ]
  },
  { name: 'Cheques', icon: Wallet, href: '/checks' },
  { name: 'Aprobaciones', icon: CheckCircle, href: '/approvals' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  // Initialize open submenus based on current path
  useEffect(() => {
    const initialOpen: Record<string, boolean> = {};
    menuItems.forEach(item => {
      if (item.children && item.children.some(child => pathname.startsWith(child.href))) {
        initialOpen[item.name] = true;
      }
    });
    setOpenSubmenus(initialOpen);
  }, [pathname]);

  if (pathname === '/login') return null;

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 overflow-y-auto scrollbar-hide">
      <div className="p-6">
        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
          ENOLA
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Admin Panel</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          if (item.children) {
            const isOpen = openSubmenus[item.name];
            const isAnyChildActive = item.children.some(child => pathname === child.href);

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                    isAnyChildActive 
                      ? "bg-slate-800/50 text-slate-100" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors duration-200",
                      isAnyChildActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                    )} />
                    {item.name}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                  )}
                </button>
                
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="pl-12 py-1 space-y-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                            isActive 
                              ? "text-blue-400 bg-blue-600/10"
                              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                          )}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href!}
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
