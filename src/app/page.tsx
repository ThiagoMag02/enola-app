'use client';

import { useAuth } from "@/contexts/AuthContext";
import { entityService } from "@/services/entityService";
import { budgetService } from "@/services/budgetService";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { useEffect, useState } from "react";
import { FileText } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [entitiesCount, setEntitiesCount] = useState<number | null>(null);
  const [budgetsCount, setBudgetsCount] = useState<number | null>(null);
  const [posCount, setPosCount] = useState<number | null>(null);

  useEffect(() => {
    // En modo demo o si hay usuario, cargamos los datos
    entityService.getAll().then((data) => setEntitiesCount(data.length)).catch(() => {});
    budgetService.getAll().then((data: any) => setBudgetsCount(data.length)).catch(() => {});
    purchaseOrderService.getAll().then((data: any) => setPosCount(data.length)).catch(() => {});
  }, [user]);

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Dashboard Overview</h2>
          <p className="text-slate-400 mt-1">Resumen general de las operaciones de ENOLA.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all duration-300 shadow-xl shadow-blue-500/5 group cursor-default">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">Entidades Activas</h3>
          <p className="text-5xl font-black mt-2 tabular-nums">{entitiesCount ?? '--'}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-xl shadow-emerald-500/5 group cursor-default">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Presupuestos</h3>
          <p className="text-5xl font-black mt-2 tabular-nums">{budgetsCount ?? '--'}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-purple-500/5 group cursor-default">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover:text-purple-400 transition-colors">Órdenes de Compra</h3>
          <p className="text-5xl font-black mt-2 tabular-nums">{posCount ?? '--'}</p>
        </div>
      </div>
    </div>
  );
}
