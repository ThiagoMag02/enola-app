'use client';

import { useState } from 'react';
import { Calendar, FileText, AlertTriangle, Loader2 } from 'lucide-react';

interface DeactivationFormProps {
  employeeName: string;
  onConfirm: (reason: string, date: string) => Promise<void>;
  onCancel: () => void;
}

export const DeactivationForm = ({ employeeName, onConfirm, onCancel }: DeactivationFormProps) => {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert('El motivo de la baja es obligatorio.');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(reason, date);
    } catch (error) {
      console.error('Error in DeactivationForm:', error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium text-sm";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="text-rose-400 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold text-rose-400">Atención</p>
          <p className="text-xs text-rose-400/80 mt-1">
            Está por dar de baja a <strong>{employeeName}</strong>. Esta acción marcará al empleado como INACTIVO en el sistema.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Fecha de Baja</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="date"
              required
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Motivo / Descripción de la Baja</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-slate-500" size={18} />
            <textarea
              required
              className={`${inputClass} min-h-[120px] pt-4 resize-none`}
              placeholder="Ej: Renuncia voluntaria, fin de contrato, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">
            Esta descripción quedará guardada para futura trazabilidad si el empleado es reincorporado.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-600/20 flex items-center gap-2 text-sm"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            'Confirmar Baja'
          )}
        </button>
      </div>
    </form>
  );
};
