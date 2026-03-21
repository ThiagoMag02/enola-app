'use client';

import { useState, useEffect } from 'react';
import { purchaseOrderService, PurchaseOrderStatus } from '@/services/purchaseOrderService';
import { tenderService, Tender } from '@/services/tenderService';
import { entityService, Entity } from '@/services/entityService';
import { ShoppingCart, Building2, Receipt, DollarSign, FileText, Loader2, Save, X } from 'lucide-react';

interface PurchaseOrderFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PurchaseOrderForm = ({ initialData, onSuccess, onCancel }: PurchaseOrderFormProps) => {
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [formData, setFormData] = useState({
    tender_id: initialData?.tender_id || '',
    provider_id: initialData?.provider_id || '',
    po_number: initialData?.po_number || '',
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    status: (initialData?.status as PurchaseOrderStatus) || 'Pending',
  });

  useEffect(() => {
    entityService.getAll().then(setEntities).catch(console.error);
    tenderService.getAll().then(setTenders).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider_id) return alert('Debes seleccionar un proveedor');
    
    setLoading(true);
    try {
      if (initialData?.id) {
        await purchaseOrderService.update(initialData.id, formData as any);
      } else {
        await purchaseOrderService.create(formData as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving PO:', error);
      alert('Error al guardar la orden de compra.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all font-medium";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  const providers = entities.filter(e => e.type === 'Provider' || e.type === 'Both');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Licitación Relacionada */}
        <div className="md:col-span-2">
          <label className={labelClass}>Licitación Asociada (Opcional)</label>
          <div className="relative">
            <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all font-medium appearance-none cursor-pointer"
              value={formData.tender_id}
              onChange={(e) => setFormData({ ...formData, tender_id: e.target.value })}
            >
              <option value="" className="bg-slate-900">Seleccionar Licitación... (Dejar vacío si es directa)</option>
              {tenders.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900">#{t.tender_number} - ({t.offer_amount} ARS)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Proveedor */}
        <div>
          <label className={labelClass}>Proveedor Seleccionado</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all font-medium appearance-none cursor-pointer"
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
            >
              <option value="" disabled className="bg-slate-900">Seleccionar Proveedor...</option>
              {providers.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900">{p.business_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Nro de Orden */}
        <div>
          <label className={labelClass}>Número de Orden Correlativo</label>
          <div className="relative">
            <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              className={inputClass}
              placeholder="Ej: OC-2026-001"
              value={formData.po_number}
              onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
            />
          </div>
        </div>

        {/* Monto Final */}
        <div>
          <label className={labelClass}>Monto Final Orden (ARS)</label>
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

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className={labelClass}>Observaciones OC</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-slate-500" size={18} />
            <textarea
              rows={3}
              className={`${inputClass} !pl-11 pt-3 resize-none`}
              placeholder="Detalles de la compra, plazos, etc..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Actualizar OC' : 'Generar OC'}</>}
        </button>
      </footer>
    </form>
  );
};
