'use client';

import { useEffect, useState } from 'react';
import { budgetService, Budget } from '@/services/budgetService';
import { Modal } from '@/components/ui/Modal';
import { BudgetForm } from '@/components/forms/BudgetForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';
import { 
  Receipt, 
  Search, 
  Plus, 
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);

  const loadBudgets = () => {
    setLoading(true);
    budgetService.getAll()
      .then(setBudgets)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    try {
      await budgetService.delete(id);
      loadBudgets();
    } catch (err) {
      console.error('Error deleting budget:', err);
      alert('No se pudo eliminar el presupuesto.');
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const filteredBudgets = budgets.filter(b => 
    b.rubro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.custom_id?.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-bottom-2 duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Receipt className="text-emerald-500" /> Presupuestos
          </h2>
          <p className="text-slate-400 mt-1">Control y seguimiento de presupuestos asignados.</p>
        </div>
        <button 
          onClick={() => {
            setEditingBudget(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-600/20"
        >
          <Plus size={20} /> Nuevo Presupuesto
        </button>
      </header>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar presupuesto..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-slate-900/40 rounded-3xl animate-pulse"></div>
             ))
        ) : filteredBudgets.length > 0 ? (
          filteredBudgets.map((budget) => (
            <div key={budget.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/50 transition-all group relative shadow-2xl">
              {/* Badge Estado */}
              <div className="absolute top-6 right-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  budget.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  budget.status === 'Draft' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                  'bg-slate-700/50 text-slate-300'
                }`}>
                  {budget.status === 'Approved' ? 'Aprobado' : budget.status === 'Draft' ? 'Borrador' : budget.status}
                </span>
              </div>

              <div className="absolute bottom-6 right-6">
                <ActionsMenu 
                  onEdit={() => {
                    setEditingBudget(budget);
                    setIsModalOpen(true);
                  }}
                  onDelete={() => handleDelete(budget.id)}
                />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner shadow-emerald-600/20">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-white uppercase group-hover:text-emerald-400 transition-colors">#{budget.custom_id || budget.id.slice(0, 5)}</h4>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{budget.rubro}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                   <Calendar size={16} className="text-slate-600" />
                   {new Date(budget.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                   <DollarSign size={16} className="text-emerald-600/50" />
                   <span className="text-lg font-bold text-slate-200">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(budget.amount)}
                   </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                   <Building2 size={16} className="text-slate-600" />
                   {budget.entity?.business_name || 'Entidad no asignada'}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex justify-between items-center bg-gradient-to-t from-slate-900/50 to-transparent -mx-6 -mb-6 p-6 rounded-b-3xl">
                <button className="text-emerald-400 text-sm font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                  Ver Detalles <FileText size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-600 bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
            <Receipt size={48} className="mb-4 opacity-10" />
            <p className="font-bold">No hay presupuestos para mostrar.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }} 
        title={editingBudget ? "Editar Presupuesto" : "Generar Nuevo Presupuesto"}
      >
        <BudgetForm 
          initialData={editingBudget}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingBudget(null);
            loadBudgets();
          }} 
          onCancel={() => {
            setIsModalOpen(false);
            setEditingBudget(null);
          }} 
        />
      </Modal>
    </div>
  );
}
