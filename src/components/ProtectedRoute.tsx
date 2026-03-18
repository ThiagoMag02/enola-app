'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <Loader2 size={48} className="text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-sm animate-pulse">
          Autenticando...
        </p>
      </div>
    );
  }

  // Si no está autenticado y no es la página de login, no renderizamos nada hasta que redirija
  if (!user && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
