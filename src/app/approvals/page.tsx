'use client';

import { useEffect, useState } from 'react';
import { approvalService } from '@/services/approvalService';
import { 
  CheckCircle, 
  Search, 
  Plus, 
  FileText,
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: getByBudget requires a budgetId, but we need a 'getAll' for the list
    // Since ApprovalService.cs didn't have a GetAll, we'll fetch from Supabase if real, or empty if mock
    setLoading(false);
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-top-4 duration-1000">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-950/20 p-6 rounded-3xl border border-emerald-900/30 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" /> Aprobaciones
          </h2>
          <p className="text-emerald-200/60 mt-1 uppercase tracking-tighter font-black text-xs">Gestión y control de resoluciones administrativas.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-600/20">
          <CheckCircle size={20} /> Aprobar Pendiente
        </button>
      </header>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-20 flex flex-col items-center justify-center text-slate-500 group">
        <div className="w-24 h-24 rounded-full bg-emerald-600/5 group-hover:bg-emerald-600/10 transition-all flex items-center justify-center border border-emerald-600/10 group-hover:border-emerald-600/20 shadow-2xl shadow-emerald-900/10 mb-6">
           <ShieldCheck size={48} className="text-emerald-500/20 group-hover:text-emerald-500/50 transition-colors" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-400 uppercase tracking-widest mb-2">Historial de Aprobaciones</h3>
        <p className="text-sm font-bold text-slate-700 uppercase tracking-tighter">No hay expedientes pendientes de resolución.</p>
      </div>
    </div>
  );
}
