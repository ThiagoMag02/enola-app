'use client';

import { useState } from 'react';
import { entityService, EntityType } from '@/services/entityService';
import { Building2, Mail, Phone, MapPin, Hash, Loader2, Save, X } from 'lucide-react';

interface EntityFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EntityForm = ({ initialData, onSuccess, onCancel }: EntityFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    custom_id: initialData?.custom_id || 'AUTO',
    business_name: initialData?.business_name || '',
    fantasy_name: initialData?.fantasy_name || '',
    cuit: initialData?.cuit || '',
    type: (initialData?.type as EntityType) || 'Client',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    is_active: initialData?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData?.id) {
        await entityService.update(initialData.id, formData);
      } else {
        await entityService.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving entity:', error);
      alert('Error al guardar la entidad. Verifica la conexión con la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID Entidad y Razón Social */}
        <div className="md:col-span-1">
          <label className={labelClass}>ID Entidad</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              disabled={!initialData?.id}
              required
              className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Ej: ENT-001"
              value={formData.custom_id === 'AUTO' ? 'Generación Automática' : formData.custom_id}
              onChange={(e) => setFormData({ ...formData, custom_id: e.target.value })}
            />
          </div>
        </div>

        <div className="md:col-span-1">
          <label className={labelClass}>Razón Social / Nombre</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              className={inputClass}
              placeholder="Ej: Tech Solutions S.A."
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            />
          </div>
        </div>

        {/* CUIT */}
        <div>
          <label className={labelClass}>CUIT (Sin guiones)</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              className={inputClass}
              placeholder="Ej: 30711111118"
              value={formData.cuit}
              onChange={(e) => setFormData({ ...formData, cuit: e.target.value.replace(/\D/g, '') })}
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className={labelClass}>Tipo de Entidad</label>
          <select 
            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium appearance-none cursor-pointer"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as EntityType })}
          >
            <option value="Client" className="bg-slate-900 font-bold">Cliente</option>
            <option value="Provider" className="bg-slate-900 font-bold">Proveedor</option>
            <option value="Both" className="bg-slate-900 font-bold">Ambos</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email de Contacto</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="email"
              className={inputClass}
              placeholder="contacto@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label className={labelClass}>Teléfono</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="+54 11 1234 5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="md:col-span-2">
          <label className={labelClass}>Dirección</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="Calle y Número, Piso, Depto"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Actualizar Entidad' : 'Guardar Entidad'}</>}
        </button>
      </footer>
    </form>
  );
};
