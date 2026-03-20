'use client';

import { useEffect, useState } from 'react';
import { invoiceService } from '@/services/invoiceService';
import { Modal } from '@/components/ui/Modal';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';
import { 
  FileText, 
  Search, 
  Plus, 
  CreditCard,
  CheckCircle2,
  Clock,
  MoreVertical,
  ArrowRight
} from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);

  const loadInvoices = () => {
    setLoading(true);
    invoiceService.getAll()
      .then(setInvoices)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    try {
      await invoiceService.delete(id);
      loadInvoices();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('No se pudo eliminar la factura.');
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-right-2 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-950/20 p-6 rounded-3xl border border-indigo-900/30 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <FileText className="text-indigo-400" /> Facturación
          </h2>
          <p className="text-indigo-200/60 mt-1 uppercase tracking-tighter font-bold text-xs">Gestión y control de cobros y pagos.</p>
        </div>
        <button 
          onClick={() => {
            setEditingInvoice(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={20} /> Registrar Factura
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 p-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
            <CheckCircle2 size={100} className="rotate-12 translate-x-1/4 translate-y-1/4" />
          </div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Facturas Cobradas</p>
          <div className="text-4xl font-extrabold text-emerald-400 mt-2">--</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 p-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
            <Clock size={100} className="rotate-12 translate-x-1/4 translate-y-1/4" />
          </div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Pendientes de Pago</p>
          <div className="text-4xl font-extrabold text-amber-400 mt-2">--</div>
        </div>
      </div>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl relative min-h-[300px] overflow-visible">
        <table className="w-full text-left">
          <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-widest font-black">
            <tr>
              <th className="px-6 py-4">N° Factura / Orden</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Importe</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={5}><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-white">{inv.invoice_number}</div>
                    <div className="text-xs text-slate-500 mt-0.5">OC: {inv.purchase_order?.po_number || '---'}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 uppercase tracking-tighter">
                   {new Date(inv.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-400 text-lg">
                    ${new Intl.NumberFormat().format(inv.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {inv.status === 'Paid' ? 'Pagada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white p-2 rounded-xl transition-all">
                        <CreditCard size={18} />
                      </button>
                      <ActionsMenu 
                        onEdit={() => {
                          setEditingInvoice(inv);
                          setIsModalOpen(true);
                        }}
                        onDelete={() => handleDelete(inv.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="py-20 text-center text-slate-500 italic">Esperando datos de facturación...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }} 
        title={editingInvoice ? "Editar Factura" : "Registrar Nueva Factura"}
      >
        <InvoiceForm 
          initialData={editingInvoice}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingInvoice(null);
            loadInvoices();
          }} 
          onCancel={() => {
            setIsModalOpen(false);
            setEditingInvoice(null);
          }} 
        />
      </Modal>
    </div>
  );
}
