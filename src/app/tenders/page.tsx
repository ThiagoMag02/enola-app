'use client';

import { useEffect, useState } from 'react';
import { tenderService } from '@/services/tenderService';
import { Modal } from '@/components/ui/Modal';
import { TenderForm } from '@/components/forms/TenderForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';
import { 
  Gavel, 
  Search, 
  Plus, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign
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

  return (
    <div className="p-8 space-y-8 animate-in zoom-in-95 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Gavel className="text-blue-400" /> Licitaciones
          </h2>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-black">Control de procesos de oferta y adjudicación.</p>
        </div>
        <button 
          onClick={() => {
            setEditingTender(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> Nueva Licitación
        </button>
      </header>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl relative min-h-[300px] overflow-visible">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest font-black">
            <tr>
              <th className="px-6 py-4">N° Tender / Ref</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Importe Ofertado</th>
              <th className="px-6 py-4">Presupuesto</th>
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
            ) : tenders.length > 0 ? (
              tenders.map((tender) => (
                <tr key={tender.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-white">{tender.tender_number}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Ref: {tender.file_number || '---'}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 uppercase tracking-tighter">
                   {new Date(tender.tender_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-400 text-lg">
                    ${new Intl.NumberFormat().format(tender.offer_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                       <FileText size={14} className="text-slate-500" />
                       #{tender.budget?.custom_id || '---'}
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
              ))
            ) : (
              <tr><td colSpan={5} className="py-20 text-center text-slate-500 italic">No hay ofertas de licitación de momento.</td></tr>
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
