'use client';

import { useEffect, useState } from 'react';
import { paymentService } from '@/services/paymentService';
import { Modal } from '@/components/ui/Modal';
import { PaymentForm } from '@/components/forms/PaymentForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';
import { formatDateLocal } from '@/lib/utils';
import { 
  CreditCard, 
  Search, 
  Plus, 
  TrendingDown,
  FileText,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any | null>(null);

  const loadPayments = () => {
    setLoading(true);
    paymentService.getAll()
      .then(setPayments)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    try {
      await paymentService.delete(id);
      loadPayments();
    } catch (err) {
      console.error('Error deleting payment:', err);
      alert('No se pudo eliminar el pago.');
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="text-purple-400" /> Pagos
          </h2>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-black">Registro de transacciones monetarias.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPayment(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-purple-600/20"
        >
          <Plus size={20} /> Nuevo Pago
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-40 bg-slate-900/40 rounded-3xl animate-pulse"></div>
             ))
        ) : payments.length > 0 ? (
          payments.map((p) => (
            <div key={p.id} className="group bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-purple-500/50 transition-all shadow-xl hover:-translate-y-1">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                     <TrendingDown size={24} />
                  </div>
                  <ActionsMenu 
                    onEdit={() => {
                      setEditingPayment(p);
                      setIsModalOpen(true);
                    }}
                    onDelete={() => handleDelete(p.id)}
                  />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">$ {new Intl.NumberFormat().format(p.amount)}</p>
                  <div className="flex items-center gap-1.5 justify-end text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                   <Calendar size={12} /> {formatDateLocal(p.date)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/50 mb-4 group-hover:bg-slate-950 transition-colors">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Método de Pago</p>
                <p className="text-sm font-bold text-slate-200">{p.method}</p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 group-hover:text-purple-300 transition-colors">
                 <FileText size={14} className="opacity-50" />
                 Factura Ref: <span className="font-mono text-slate-500 group-hover:text-purple-400">{p.invoice_id?.slice(0,8) || '---'}</span>
                 <CheckCircle2 size={14} className="ml-auto text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600">
             <CreditCard size={40} className="mb-4 opacity-5" />
             <p className="font-black uppercase tracking-tighter text-sm">Sin transacciones registradas hasta hoy.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingPayment(null);
        }} 
        title={editingPayment ? "Editar Pago" : "Registrar Nuevo Pago"}
      >
        <PaymentForm 
          initialData={editingPayment}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingPayment(null);
            loadPayments();
          }} 
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPayment(null);
          }} 
        />
      </Modal>
    </div>
  );
}
