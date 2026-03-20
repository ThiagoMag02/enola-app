'use client';

import { useState, useEffect } from 'react';
import { budgetService, BudgetStatus } from '@/services/budgetService';
import { entityService, Entity } from '@/services/entityService';
import { Briefcase, Building2, Calendar, DollarSign, FileText, Hash, Loader2, Save, X } from 'lucide-react';

interface BudgetFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BudgetForm = ({ initialData, onSuccess, onCancel }: BudgetFormProps) => {
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [formData, setFormData] = useState({
    custom_id: initialData?.custom_id || '',
    entity_id: initialData?.entity_id || '',
    provider_id: initialData?.provider_id || '',
    rubro: initialData?.rubro || '',
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    status: (initialData?.status as BudgetStatus) || 'Draft',
  });

  useEffect(() => {
    entityService.getAll().then(setEntities).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entity_id) return alert('Debes seleccionar una entidad');
    
    setLoading(true);
    try {
      // Limpiamos campos opcionales para evitar errores de tipo UUID en Supabase
      const cleanData = {
        ...formData,
        provider_id: formData.provider_id || null,
        custom_id: formData.custom_id || null,
        description: formData.description || null,
      };

      if (initialData?.id) {
        await budgetService.update(initialData.id, cleanData as any);
      } else {
        await budgetService.create(cleanData as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Error al guardar el presupuesto: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID Presupuesto y Entidad */}
        <div className="md:col-span-1">
          <label className={labelClass}>ID Presupuesto</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="Ej: PR-2026-001"
              value={formData.custom_id}
              onChange={(e) => setFormData({ ...formData, custom_id: e.target.value })}
            />
          </div>
        </div>

        <div className="md:col-span-1">
          <label className={labelClass}>Entidad Solicitante</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium appearance-none cursor-pointer"
              value={formData.entity_id}
              onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
            >
              <option value="" disabled className="bg-slate-900">Seleccionar...</option>
              {entities.map(e => (
                <option key={e.id} value={e.id} className="bg-slate-900">{e.business_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rubro */}
        <div>
          <label className={labelClass}>Rubro / Categoría</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              className={inputClass}
              placeholder="Ej: Infraestructura, IT, Servicios"
              value={formData.rubro}
              onChange={(e) => setFormData({ ...formData, rubro: e.target.value })}
            />
          </div>
        </div>

        {/* Monto */}
        <div>
          <label className={labelClass}>Monto Estimado (ARS)</label>
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
          <label className={labelClass}>Descripción / Nota</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-slate-500" size={18} />
            <textarea
              rows={3}
              className={`${inputClass} !pl-11 pt-3 resize-none`}
              placeholder="Detalles adicionales del presupuesto..."
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
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}</>}
        </button>
      </footer>
    </form>
  );
};
