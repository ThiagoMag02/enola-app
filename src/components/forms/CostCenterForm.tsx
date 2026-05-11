'use client';

import { useState, useEffect } from 'react';
import { costCenterService } from '@/services/costCenterService';
import { companyService, Company } from '@/services/companyService';
import { Building2, Hash, Calendar, Layers, Loader2, Save, X } from 'lucide-react';

interface CostCenterFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CostCenterForm = ({ initialData, onSuccess, onCancel }: CostCenterFormProps) => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    company_id: initialData?.company_id || '',
    number: initialData?.number || '',
    year: initialData?.year || new Date().getFullYear().toString(),
    name: initialData?.name || '',
  });

  useEffect(() => {
    companyService.getAll().then(setCompanies).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData?.id) {
        await costCenterService.update(initialData.id, formData);
      } else {
        await costCenterService.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving cost center:', error);
      alert('Error al guardar el centro de costo.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium text-sm";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";
  const selectClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium text-sm appearance-none cursor-pointer";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={labelClass}>Empresa / Comitente</label>
          <select 
            required
            className={selectClass}
            value={formData.company_id}
            onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
          >
            <option value="" className="bg-slate-900">Seleccionar empresa...</option>
            {companies.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900">{c.name} ({c.cuit})</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Número de Centro</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              readOnly
              className={`${inputClass} bg-slate-900/50 text-slate-500 cursor-not-allowed`}
              placeholder="AUTO"
              value={formData.number || (initialData?.id ? '' : 'GENERACIÓN AUTOMÁTICA')}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Año</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              className={inputClass}
              placeholder="Ej: 2024"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Nombre del Centro de Costo</label>
          <div className="relative">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              className={inputClass}
              placeholder="Ej: Obra Puente Maipú"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Actualizar' : 'Guardar Centro'}</>}
        </button>
      </footer>
    </form>
  );
};
