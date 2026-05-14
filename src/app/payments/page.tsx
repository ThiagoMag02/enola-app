'use client';

import { useEffect, useState } from 'react';
import { paymentService } from '@/services/paymentService';
import { Modal } from '@/components/ui/Modal';
import { PaymentForm } from '@/components/forms/PaymentForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';
import { formatDateLocal } from '@/lib/utils';
import { 
  CreditCard, 
  Plus, 
  FileText,
  FileDown
} from 'lucide-react';
import { exportToPdf, fmtCurrency, fmtDate } from '@/lib/pdfExport';

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

  const formatCurrency = (amount: number) => {
    return `$${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="text-purple-400" /> Pagos
          </h2>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-black">Registro de transacciones monetarias.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              exportToPdf({
                title: 'Registro de Pagos',
                subtitle: 'Historial de transacciones monetarias realizadas',
                fileName: `pagos_${new Date().toISOString().split('T')[0]}`,
                columns: [
                  { header: 'Fecha', dataKey: 'date' },
                  { header: 'Factura', dataKey: 'invoice_ref' },
                  { header: 'OC', dataKey: 'po_ref' },
                  { header: 'Método', dataKey: 'method' },
                  { header: 'Importe', dataKey: 'amount', align: 'right' },
                ],
                data: payments.map((p: any) => ({
                  date: fmtDate(p.date),
                  invoice_ref: p.invoice?.invoice_number || '---',
                  po_ref: p.invoice?.purchase_order?.po_number || '---',
                  method: p.method,
                  amount: fmtCurrency(p.amount),
                })),
              });
            }}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
            title="Exportar a PDF"
          >
            <FileDown size={18} /> PDF
          </button>
          <button 
            onClick={() => {
              setEditingPayment(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-purple-600/20"
          >
            <Plus size={20} /> Nuevo Pago
          </button>
        </div>
      </header>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl relative min-h-[300px] overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800 sticky top-0 z-20 text-slate-400 text-[10px] uppercase tracking-widest font-black shadow-md">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Factura Asociada</th>
              <th className="px-6 py-4">OC Relacionada</th>
              <th className="px-6 py-4">Método de Pago</th>
              <th className="px-6 py-4">Importe</th>
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
            ) : payments.length > 0 ? (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-white group-hover:text-purple-400 transition-colors">
                      {formatDateLocal(p.date, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-300">
                        {p.invoice?.invoice_number || '---'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-purple-400">
                      {p.invoice?.purchase_order?.po_number || '---'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit bg-slate-700/30 text-slate-400 border border-slate-700/50">
                      {p.method}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionsMenu 
                      onEdit={() => {
                        setEditingPayment(p);
                        setIsModalOpen(true);
                      }}
                      onDelete={() => handleDelete(p.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs italic">Sin transacciones registradas hasta hoy.</td></tr>
            )}
          </tbody>
        </table>
      </div></div>

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
