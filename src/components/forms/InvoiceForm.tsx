'use client';

import { useState, useEffect } from 'react';
import { invoiceService } from '@/services/invoiceService';
import { purchaseOrderService } from '@/services/purchaseOrderService';
import { FileText, ShoppingCart, DollarSign, Loader2, Save, X, Calendar, Calculator } from 'lucide-react';

interface InvoiceFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const InvoiceForm = ({ initialData, onSuccess, onCancel }: InvoiceFormProps) => {
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<any[]>([]);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const getCurrentDate = () => {
    const now = new Date();
    const local = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return local.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    purchase_order_id: initialData?.purchase_order_id || '',
    invoice_number: initialData?.invoice_number || '',
    amount: initialData?.amount || 0,
    status: initialData?.status || 'Pending',
    date: initialData?.date?.split('T')[0] || getCurrentDate(),
  });

  useEffect(() => {
    purchaseOrderService.getAll().then(setPos).catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.purchase_order_id) {
       const po = pos.find(p => p.id === formData.purchase_order_id);
       setSelectedPO(po);
    } else {
       setSelectedPO(null);
    }
  }, [formData.purchase_order_id, pos]);

  const calculateRemaining = () => {
    if (!selectedPO) return 0;
    const totalInvoiced = (selectedPO.invoices || []).reduce((acc: number, curr: any) => {
        // Si estamos editando, no sumamos la propia factura actual para no restarla dos veces del balance
        if (initialData?.id && curr.id === initialData.id) return acc;
        return acc + Number(curr.amount || 0);
    }, 0);
    return selectedPO.amount - totalInvoiced;
  };

  const remainingToInvoice = calculateRemaining();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.purchase_order_id) return alert('Debes seleccionar una OC');
    
    setLoading(true);
    try {
      if (initialData?.id) {
        await invoiceService.update(initialData.id, formData as any);
      } else {
        await invoiceService.create(formData as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error al guardar la factura.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OC Relacionada */}
        <div className="md:col-span-2">
          <label className={labelClass}>Orden de Compra Asociada</label>
          <div className="relative">
            <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium appearance-none cursor-pointer"
              value={formData.purchase_order_id}
              onChange={(e) => setFormData({ ...formData, purchase_order_id: e.target.value })}
            >
              <option value="" disabled className="bg-slate-900">Seleccionar OC...</option>
              {pos.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900">{p.po_number || p.id.slice(0,8)} - ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.amount)}</option>
              ))}
            </select>
          </div>
          
          {selectedPO && (
            <div className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-in fade-in slide-in-from-top-1">
              <Calculator size={14} className="text-blue-400" />
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-tighter">
                Restante a Facturar: 
                <span className="ml-2 text-sm font-mono text-white">
                    ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(remainingToInvoice)}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Fecha */}
        <div>
          <label className={labelClass}>Fecha</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              type="date"
              className={inputClass}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>

        {/* Nro de Factura */}
        <div>
          <label className={labelClass}>Número de Factura</label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              className={inputClass}
              placeholder="Ej: A-0001-00001234"
              value={formData.invoice_number}
              onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
            />
          </div>
        </div>

        {/* Importe */}
        <div className="md:col-span-2">
          <label className={labelClass}>Monto a Facturar (ARS)</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              type="number"
              step="0.01"
              max={remainingToInvoice > 0 ? remainingToInvoice : undefined}
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
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Actualizar Factura' : 'Registrar Factura'}</>}
        </button>
      </footer>
    </form>
  );
};
