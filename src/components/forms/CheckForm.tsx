'use client';

import { useState, useEffect } from 'react';
import { checkService, CheckStatus } from '@/services/checkService';
import { entityService, Entity } from '@/services/entityService';
import { Building2, Calendar, FileText, Loader2, Save, X, Tag, DollarSign, Type } from 'lucide-react';

interface CheckFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CheckForm = ({ initialData, onSuccess, onCancel }: CheckFormProps) => {
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);

  const getCurrentDate = () => {
    const now = new Date();
    const local = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return local.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    issue_date: initialData?.issue_date ? new Date(initialData.issue_date).toISOString().split('T')[0] : getCurrentDate(),
    due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : getCurrentDate(),
    check_number: initialData?.check_number || '',
    provider_id: initialData?.provider_id || '',
    amount: initialData?.amount || 0,
    status: (initialData?.status as CheckStatus) || 'Pendiente',
    observations: initialData?.observations || '',
    details: initialData?.details || '',
  });

  useEffect(() => {
    entityService.getAll().then(setEntities).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider_id) return alert('Debes seleccionar una empresa/proveedor');

    setLoading(true);
    try {
      const cleanData = {
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        check_number: formData.check_number,
        provider_id: formData.provider_id,
        amount: formData.amount,
        status: formData.status,
        observations: formData.observations || null,
        details: formData.details || null,
      };

      if (initialData?.id) {
        await checkService.update(initialData.id, cleanData as any);
      } else {
        await checkService.create(cleanData as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving check:', error);
      alert('Error al guardar el cheque: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Empresa / Proveedor */}
        <div className="md:col-span-2">
          <label className={labelClass}>Empresa / Proveedor</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <select
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium appearance-none cursor-pointer"
              value={formData.provider_id}
              onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
            >
              <option value="" disabled className="bg-slate-900">Seleccionar Empresa...</option>
              {entities.map(e => (
                <option key={e.id} value={e.id} className="bg-slate-900">{e.business_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Nro de Cheque */}
        <div>
          <label className={labelClass}>Número de Cheque</label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              type="text"
              className={inputClass}
              placeholder="Ej: 12345678"
              value={formData.check_number}
              onChange={(e) => setFormData({ ...formData, check_number: e.target.value })}
            />
          </div>
        </div>

        {/* Monto */}
        <div>
          <label className={labelClass}>Importe (ARS)</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
            <input
              required
              type="number"
              step="0.01"
              className={`${inputClass} border-emerald-500/30 text-emerald-400 font-bold`}
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        {/* Fecha Emisión */}
        <div>
          <label className={labelClass}>Fecha de Emisión</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              type="date"
              className={inputClass}
              value={formData.issue_date}
              onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
            />
          </div>
        </div>

        {/* Fecha Vencimiento */}
        <div>
          <label className={labelClass}>Fecha de Vencimiento</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
            <input
              required
              type="date"
              className={inputClass}
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
        </div>

        {/* Estado */}
        <div className="md:col-span-2">
          <label className={labelClass}>Estado</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="Pendiente"
                checked={formData.status === 'Pendiente'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CheckStatus })}
                className="w-4 h-4 text-rose-500 bg-slate-900 border-slate-700 focus:ring-rose-500"
              />
              <span className="text-sm font-bold text-slate-300">Pendiente</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="Pagado"
                checked={formData.status === 'Pagado'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CheckStatus })}
                className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
              />
              <span className="text-sm font-bold text-slate-300">Pagado</span>
            </label>
          </div>
        </div>

        {/* Observaciones (Corta) */}
        <div className="md:col-span-2">
          <label className={labelClass}>Observaciones Breves</label>
          <div className="relative">
            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              className={inputClass}
              placeholder="Resumen del cheque (Opcional)"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              maxLength={100}
            />
          </div>
        </div>

        {/* Detalle Ampliado */}
        <div className="md:col-span-2">
          <label className={labelClass}>Detalle / Recordatorio / Concepto (Ampliado)</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-slate-500" size={18} />
            <textarea
              rows={4}
              className={`${inputClass} !pl-11 pt-3 resize-none`}
              placeholder="Detalles sobre por qué se entregó, información sobre parcialidades, etc."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
          </div>
        </div>
      </div>

      <footer className="pt-8 flex justify-end gap-4 mt-8 bg-slate-900/50 p-4 -mx-6 -mb-6 md:rounded-b-3xl border-t border-slate-800">
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
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Actualizar Cheque' : 'Guardar Cheque'}</>}
        </button>
      </footer>
    </form>
  );
};
