'use client';

import { useState, useEffect } from 'react';
import { paymentService } from '@/services/paymentService';
import { invoiceService } from '@/services/invoiceService';
import { CreditCard, FileText, DollarSign, Loader2, Save, X } from 'lucide-react';

interface PaymentFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentForm = ({ initialData, onSuccess, onCancel }: PaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    invoice_id: initialData?.invoice_id || '',
    amount: initialData?.amount || 0,
    method: initialData?.method || 'Transfer',
  });

  useEffect(() => {
    invoiceService.getAll().then(setInvoices).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoice_id) return alert('Debes seleccionar una factura');
    
    setLoading(true);
    try {
      if (initialData?.id) {
        await paymentService.update(initialData.id, formData as any);
      } else {
        await paymentService.create(formData as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Error al guardar el pago.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Factura Relacionada */}
        <div className="md:col-span-2">
          <label className={labelClass}>Factura a Pagar / Cobrar</label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium appearance-none cursor-pointer"
              value={formData.invoice_id}
              onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
            >
              <option value="" disabled className="bg-slate-900">Seleccionar Factura...</option>
              {invoices.map(inv => (
                <option key={inv.id} value={inv.id} className="bg-slate-900">{inv.invoice_number} - ${inv.amount}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Método de Pago */}
        <div>
          <label className={labelClass}>Método de Pago</label>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium appearance-none cursor-pointer"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            >
              <option value="Transfer" className="bg-slate-900">Transferencia Bancaria</option>
              <option value="Cash" className="bg-slate-900">Efectivo</option>
              <option value="Check" className="bg-slate-900">Cheque</option>
              <option value="Card" className="bg-slate-900">Tarjeta</option>
            </select>
          </div>
        </div>

        {/* Importe del Pago */}
        <div>
          <label className={labelClass}>Monto del Pago (ARS)</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <footer className="pt-8 flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-2"
        >
          <X size={18} /> Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Actualizar Pago' : 'Registrar Pago'}</>}
        </button>
      </footer>
    </form>
  );
};
