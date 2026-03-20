'use client';

import { useState, useEffect } from 'react';
import { tenderService } from '@/services/tenderService';
import { budgetService } from '@/services/budgetService';
import { Gavel, Receipt, DollarSign, FileText, Loader2, Save, X, Calendar } from 'lucide-react';

interface TenderFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TenderForm = ({ initialData, onSuccess, onCancel }: TenderFormProps) => {
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    budget_id: initialData?.budget_id || '',
    tender_number: initialData?.tender_number || '',
    offer_amount: initialData?.offer_amount || 0,
    file_number: initialData?.file_number || '',
  });

  useEffect(() => {
    budgetService.getAll().then(setBudgets).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.budget_id) return alert('Debes seleccionar un presupuesto');
    
    setLoading(true);
    try {
      if (initialData?.id) {
        await tenderService.update(initialData.id, formData as any);
      } else {
        await tenderService.create(formData as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving tender:', error);
      alert('Error al guardar la licitación.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all font-medium";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Presupuesto Relacionado */}
        <div className="md:col-span-2">
          <label className={labelClass}>Presupuesto de Origen</label>
          <div className="relative">
            <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all font-medium appearance-none cursor-pointer"
              value={formData.budget_id}
              onChange={(e) => setFormData({ ...formData, budget_id: e.target.value })}
            >
              <option value="" disabled className="bg-slate-900">Seleccionar Presupuesto...</option>
              {budgets.map(b => (
                <option key={b.id} value={b.id} className="bg-slate-900">#{b.custom_id || b.id.slice(0,5)} - {b.rubro}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Nro de Licitación */}
        <div>
          <label className={labelClass}>Número de Licitación</label>
          <div className="relative">
            <Gavel className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              className={inputClass}
              placeholder="Ej: LIC-2026-X"
              value={formData.tender_number}
              onChange={(e) => setFormData({ ...formData, tender_number: e.target.value })}
            />
          </div>
        </div>

        {/* Nro de Expediente */}
        <div>
          <label className={labelClass}>Número de Expediente</label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="Ej: EXP-12345/26"
              value={formData.file_number}
              onChange={(e) => setFormData({ ...formData, file_number: e.target.value })}
            />
          </div>
        </div>

        {/* Monto Ofertado */}
        <div>
          <label className={labelClass}>Monto de la Oferta (ARS)</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              type="number"
              step="0.01"
              className={inputClass}
              placeholder="0.00"
              value={formData.offer_amount || ''}
              onChange={(e) => setFormData({ ...formData, offer_amount: parseFloat(e.target.value) })}
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
          className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Actualizar Licitación' : 'Registrar Licitación'}</>}
        </button>
      </footer>
    </form>
  );
};
