'use client';

import { useEffect, useState } from 'react';
import { invoiceService } from '@/services/invoiceService';
import { Modal } from '@/components/ui/Modal';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';
import {
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Plus
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
    if (!confirm('¿Seguro que deseas eliminar esta factura?')) return;
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

  // Agrupar facturas por OC
  const groupedInvoices = invoices.reduce((acc: Record<string, any[]>, inv) => {
    const poId = inv.purchase_order_id || 'DIRECTA';
    if (!acc[poId]) acc[poId] = [];
    acc[poId].push(inv);
    return acc;
  }, {});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const calculatePaid = (inv: any) => {
    return (inv.payments || []).reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
  };

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-right-2 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-950/20 p-6 rounded-3xl border border-indigo-900/30 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <FileText className="text-indigo-400" /> Facturación y Cobros
          </h2>
          <p className="text-indigo-200/60 mt-1 uppercase tracking-tighter font-bold text-xs">Control de saldos por OC y seguimiento de pagos.</p>
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

      <div className="space-y-12">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-indigo-400 font-bold uppercase tracking-widest">Cargando Facturas...</div>
        ) : Object.keys(groupedInvoices).length > 0 ? (
          Object.entries(groupedInvoices).map(([poId, invs]) => {
            const po = invs[0]?.purchase_order;
            const totalOC = po?.amount || 0;
            const totalFacturadoOC = invs.reduce((acc, curr) => acc + Number(curr.amount), 0);
            const pendienteOC = totalOC - totalFacturadoOC;

            return (
              <section key={poId} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <ShoppingCart size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        {po ? `OC: ${po.po_number || poId.slice(0, 8)}` : 'Facturación Directa'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        Total OC: {formatCurrency(totalOC)} | <span className={pendienteOC > 0 ? 'text-amber-500' : 'text-emerald-500'}>Restante: {formatCurrency(pendienteOC)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-800/50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                      <tr>
                        <th className="px-6 py-4">N° Factura / Fecha</th>
                        <th className="px-6 py-4">Importe Factura</th>
                        <th className="px-6 py-4">Pagado</th>
                        <th className="px-6 py-4">Pendiente de Pago</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {invs.map((inv) => {
                        const paid = calculatePaid(inv);
                        const remaining = inv.amount - paid;
                        const isPaid = remaining <= 0;

                        return (
                          <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{inv.invoice_number}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5 font-bold">{new Date(inv.date).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-400">
                              {formatCurrency(inv.amount)}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-emerald-500 font-bold">
                              {formatCurrency(paid)}
                            </td>
                            <td className="px-6 py-4">
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit font-black text-[10px] ${isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                {isPaid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                {isPaid ? 'LIQUIDADA' : formatCurrency(remaining)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <ActionsMenu
                                onEdit={() => {
                                  setEditingInvoice(inv);
                                  setIsModalOpen(true);
                                }}
                                onDelete={() => handleDelete(inv.id)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })
        ) : (
          <div className="py-40 text-center text-slate-600 font-black uppercase tracking-widest italic border-2 border-dashed border-slate-800 rounded-3xl">Sin facturas registradas.</div>
        )}
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
