'use client';

import { useEffect, useState } from 'react';
import { purchaseOrderService } from '@/services/purchaseOrderService';
import { Modal } from '@/components/ui/Modal';
import { PurchaseOrderForm } from '@/components/forms/PurchaseOrderForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';
import { 
  ShoppingCart, 
  Plus, 
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<any | null>(null);

  const loadPOs = () => {
    setLoading(true);
    purchaseOrderService.getAll()
      .then(setPos)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    try {
      await purchaseOrderService.delete(id);
      loadPOs();
    } catch (err) {
      console.error('Error deleting PO:', err);
      alert('No se pudo eliminar la orden de compra.');
    }
  };

  useEffect(() => {
    loadPOs();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in zoom-in-95 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <ShoppingCart className="text-blue-400" /> Órdenes de Compra
          </h2>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-black">Gestión de suministros y vinculación con expedientes.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPO(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> Nueva OC
        </button>
      </header>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl relative min-h-[300px] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
            <tr>
              <th className="px-6 py-4">N° Orden / Fecha</th>
              <th className="px-6 py-4">Expediente / Licitación</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Importe</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={6}><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : pos.length > 0 ? (
              pos.map((po) => {
                const description = po.tender?.budget?.description || po.approval?.budget?.description || '';
                
                return (
                  <tr key={po.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{po.po_number || '---'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-tighter">
                        {new Date(po.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-purple-400 flex items-center gap-1">
                          <FileText size={12} />
                          {po.tender?.file_number || 'S/N'}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                          {po.tender ? `LIC: ${po.tender.tender_number}` : po.approval ? `APROB: ${po.approval.id.slice(0,8)}` : 'DIRECTA'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-slate-400 font-medium max-w-[200px] truncate" title={description}>
                        {description.replace(/^\[EMPRESA: .*?\]\n\n/, '') || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                      ${new Intl.NumberFormat('es-AR').format(po.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit ${
                        po.status === 'Billed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        po.status === 'Partial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'bg-slate-700/30 text-slate-400 border border-slate-700/50'
                      }`}>
                        {po.status === 'Billed' ? <CheckCircle2 size={12} /> : 
                        po.status === 'Partial' ? <Clock size={12} /> : 
                        <AlertCircle size={12} />}
                        {po.status === 'Billed' ? 'Completado' : po.status === 'Partial' ? 'Parcial' : 'Pendiente'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu 
                        onEdit={() => {
                          setEditingPO(po);
                          setIsModalOpen(true);
                        }}
                        onDelete={() => handleDelete(po.id)}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={6} className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs italic">Sin órdenes de compra registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingPO(null);
        }} 
        title={editingPO ? "Editar Orden de Compra" : "Generar Nueva Orden de Compra"}
      >
        <PurchaseOrderForm 
          initialData={editingPO}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingPO(null);
            loadPOs();
          }} 
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPO(null);
          }} 
        />
      </Modal>
    </div>
  );
}
