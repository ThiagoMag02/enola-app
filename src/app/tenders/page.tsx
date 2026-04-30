'use client';

import { useEffect, useState } from 'react';
import { tenderService } from '@/services/tenderService';
import { Modal } from '@/components/ui/Modal';
import { TenderForm } from '@/components/forms/TenderForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';
import { formatDateLocal } from '@/lib/utils';
import { exportToPdf, fmtCurrency, fmtDate } from '@/lib/pdfExport';
import { 
  Gavel, 
  Search, 
  Plus, 
  TrendingDown,
  TrendingUp,
  FileText,
  DollarSign,
  FileDown
} from 'lucide-react';

export default function TendersPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTender, setEditingTender] = useState<any | null>(null);

  const loadTenders = () => {
    setLoading(true);
    tenderService.getAll()
      .then(setTenders)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    try {
      await tenderService.delete(id);
      loadTenders();
    } catch (err) {
      console.error('Error deleting tender:', err);
      alert('No se pudo eliminar la licitación.');
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  const calculateDiff = (offer: number, budget: number) => {
    if (!budget || budget === 0) return 0;
    return ((offer - budget) / budget) * 100;
  };

  const formatCurrency = (amount: number) => {
    return `$${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
  };

  return (
    <div className="p-8 space-y-8 animate-in zoom-in-95 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Gavel className="text-blue-400" /> Licitaciones
          </h2>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-black">Control de procesos de oferta y adjudicación respecto al presupuesto.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              exportToPdf({
                title: 'Licitaciones',
                subtitle: 'Procesos de oferta y adjudicación respecto al presupuesto',
                fileName: `licitaciones_${new Date().toISOString().split('T')[0]}`,
                columns: [
                  { header: 'N° Proceso', dataKey: 'tender_number' },
                  { header: 'Fecha', dataKey: 'tender_date' },
                  { header: 'Presupuesto Ref', dataKey: 'budget_ref' },
                  { header: 'Expediente', dataKey: 'file_number' },
                  { header: 'Monto Presupuesto', dataKey: 'budget_amount', align: 'right' },
                  { header: 'Monto Ofertado', dataKey: 'offer_amount', align: 'right' },
                  { header: 'OC', dataKey: 'oc_info' },
                  { header: 'Diferencia %', dataKey: 'diff', align: 'right' },
                ],
                data: tenders.map((t: any) => {
                  const diff = t.budget?.amount ? (((t.offer_amount - t.budget.amount) / t.budget.amount) * 100).toFixed(2) : '---';
                  const linkedOC = t.purchase_orders?.[0];
                  return {
                    tender_number: t.tender_number,
                    tender_date: fmtDate(t.tender_date),
                    budget_ref: `#${t.budget?.custom_id || 'S/N'} - ${t.budget?.rubro || ''}`,
                    file_number: t.file_number || 'No asignado',
                    budget_amount: fmtCurrency(t.budget?.amount),
                    offer_amount: fmtCurrency(t.offer_amount),
                    oc_info: linkedOC ? `#${linkedOC.po_number}` : 'FALTA',
                    diff: diff !== '---' ? `${diff}%` : '---',
                  };
                }),
              });
            }}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
            title="Exportar a PDF"
          >
            <FileDown size={18} /> PDF
          </button>
          <button 
            onClick={() => {
              setEditingTender(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} /> Nueva Licitación
          </button>
        </div>
      </header>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl relative min-h-[300px] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
            <tr>
              <th className="px-6 py-4">Proceso / Ref</th>
              <th className="px-6 py-4">Presupuesto Referencia</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Monto Presupuesto</th>
              <th className="px-6 py-4">Monto Ofertado</th>
              <th className="px-6 py-4">OC</th>
              <th className="px-6 py-4">Diferencia (%)</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={9}><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : tenders.length > 0 ? (
              tenders.map((tender) => {
                const diff = calculateDiff(tender.offer_amount, tender.budget?.amount);
                const isOver = diff >= 0;
                const linkedOC = tender.purchase_orders?.[0];
                const ocDate = linkedOC ? formatDateLocal(linkedOC.date) : null;

                return (
                  <tr key={tender.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{tender.tender_number}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-bold">FECHA: {formatDateLocal(tender.tender_date)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          <FileText size={12} className="text-slate-500" />
                          #{tender.budget?.custom_id || 'S/N'}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter truncate max-w-[150px]">
                          {tender.budget?.rubro}
                        </span>
                        <span className="text-[9px] text-amber-400 font-bold">
                          Expte: {tender.file_number || 'No asignado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-slate-400 font-medium max-w-[200px] truncate" title={tender.budget?.description}>
                        {(tender.budget?.description || '').replace(/^\[EMPRESA: .*?\]\n\n/, '') || '---'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {formatCurrency(tender.budget?.amount || 0)}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                      {formatCurrency(tender.offer_amount)}
                    </td>
                    <td className="px-6 py-4">
                      {ocDate ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-blue-400">#{linkedOC.po_number}</span>
                          <span className="text-[10px] font-bold text-slate-400">{ocDate}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">FALTA</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit font-black text-[10px] ${isOver ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {isOver ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {diff.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu 
                        onEdit={() => {
                          setEditingTender(tender);
                          setIsModalOpen(true);
                        }}
                        onDelete={() => handleDelete(tender.id)}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={9} className="py-20 text-center text-slate-500 italic font-bold">No hay licitaciones registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTender(null);
        }} 
        title={editingTender ? "Editar Licitación" : "Registrar Licitación"}
      >
        <TenderForm 
          initialData={editingTender}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingTender(null);
            loadTenders();
          }} 
          onCancel={() => {
            setIsModalOpen(false);
            setEditingTender(null);
          }} 
        />
      </Modal>
    </div>
  );
}
