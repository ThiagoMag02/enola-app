'use client';

import { useEffect, useState } from 'react';
import { purchaseOrderService } from '@/services/purchaseOrderService';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ArrowRight
} from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    purchaseOrderService.getAll()
      .then(setPos)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in zoom-in-95 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <ShoppingCart className="text-blue-400" /> Órdenes de Compra
          </h2>
          <p className="text-slate-400 mt-1">Seguimiento de compras y estados de facturación.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/20">
          <Plus size={20} /> Nueva OC
        </button>
      </header>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest font-black">
            <tr>
              <th className="px-6 py-4">N° Orden / Fecha</th>
              <th className="px-6 py-4">Licitación / Aprobación</th>
              <th className="px-6 py-4">Importe</th>
              <th className="px-6 py-4">Estado de Facturación</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={5}><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : pos.length > 0 ? (
              pos.map((po) => (
                <tr key={po.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-white">{po.po_number}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{new Date(po.date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-400 font-medium">
                      {po.tender ? `Lic: ${po.tender.tender_number}` : po.approval ? `Aprob: ${po.approval.id.slice(0,8)}` : 'Vínculo Directo'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-400">
                    ${new Intl.NumberFormat().format(po.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                      po.status === 'Billed' ? 'text-emerald-400' : 
                      po.status === 'Partial' ? 'text-amber-400' : 
                      'text-slate-400'
                    }`}>
                      {po.status === 'Billed' ? <CheckCircle2 size={14} /> : 
                       po.status === 'Partial' ? <Clock size={14} /> : 
                       <AlertCircle size={14} />}
                      {po.status === 'Billed' ? 'Completada' : po.status === 'Partial' ? 'Facturación Parcial' : 'Pendiente'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="py-20 text-center text-slate-600 font-bold">Sin órdenes registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
