'use client';

import { useEffect, useState } from 'react';
import { budgetService, Budget } from '@/services/budgetService';
import { approvalService } from '@/services/approvalService';
import { entityService } from '@/services/entityService';
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
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';

const RUBROS = [
  "Indumentaria", "Obras y Servicios", "Electricidad", "Equipos Alquiler",
  "Forestación", "Pintura vial", "Farmacia", "Ferreteria"
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Approved' | 'Rejected' | 'Draft'>('All');
  const [selectedRubro, setSelectedRubro] = useState('All');
  const [selectedEntity, setSelectedEntity] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);
  
  // States for Approval with File Number
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingBudgetId, setApprovingBudgetId] = useState<string | null>(null);
  const [approvalFileNumber, setApprovalFileNumber] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const loadBudgets = () => {
    setLoading(true);
    Promise.all([
      budgetService.getAll(),
      entityService.getAll()
    ]).then(([budgetsData, entitiesData]) => {
      setBudgets(budgetsData);
      setEntities(entitiesData);
    })
    .finally(() => setLoading(false));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este presupuesto?')) return;
    try {
      await budgetService.delete(id);
      loadBudgets();
    } catch (err) {
      console.error('Error deleting budget:', err);
      alert('No se pudo eliminar el presupuesto.');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    if (status === 'Approved') {
        setApprovingBudgetId(id);
        setApprovalFileNumber('');
        setIsApprovalModalOpen(true);
        return;
    }

    try {
      await budgetService.updateStatus(id, status);
      loadBudgets();
    } catch (err) {
      console.error('Error updating budget status:', err);
      alert('No se pudo actualizar el estado.');
    }
  };

  const confirmApproval = async () => {
    if (!approvingBudgetId) return;
    if (!approvalFileNumber) return alert('Debes cargar el numero de expediente');

    setIsApproving(true);
    try {
        await approvalService.approveBudget(approvingBudgetId, approvalFileNumber);
        setIsApprovalModalOpen(false);
        setApprovingBudgetId(null);
        setApprovalFileNumber('');
        loadBudgets();
    } catch (err) {
        console.error('Error approving budget:', err);
        alert('Ocurrió un error al aprobar el presupuesto.');
    } finally {
        setIsApproving(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch = b.rubro?.toLowerCase().includes(searchTerm.toLowerCase()) || b.custom_id?.includes(searchTerm);
    const matchesFilter = filterType === 'All' ? true : b.status === filterType;
    const matchesRubro = selectedRubro === 'All' ? true : b.rubro?.toLowerCase() === selectedRubro.toLowerCase();
    const matchesEntity = selectedEntity === 'All' ? true : b.entity?.id === selectedEntity;
    
    return matchesSearch && matchesFilter && matchesRubro && matchesEntity;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const selectClass = "bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer hover:border-slate-700 transition-all min-w-[150px]";

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-bottom-2 duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Receipt className="text-emerald-500" /> Presupuestos
          </h2>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-black">Control y gestión de ofertas presupuestarias.</p>
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

      <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar por ID o Rubro..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium border-emerald-500/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex bg-slate-910/80 border border-slate-800 rounded-2xl p-1 shrink-0 overflow-x-auto">
              <button 
                onClick={() => setFilterType('All')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === 'All' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-200'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterType('Draft')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === 'Draft' ? 'bg-blue-500/20 text-blue-400 shadow-md' : 'text-slate-500 hover:text-blue-400'}`}
              >
                Borrador
              </button>
              <button 
                onClick={() => setFilterType('Approved')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-emerald-400'}`}
              >
                Aprobados
              </button>
              <button 
                onClick={() => setFilterType('Rejected')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === 'Rejected' ? 'bg-orange-500/20 text-orange-400 shadow-md' : 'text-slate-500 hover:text-orange-400'}`}
              >
                Desaprobados
              </button>
            </div>
          </div>

          {/* Filtros Adicionales */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mr-2">
                <Filter size={14} /> Filtrar por:
            </div>
            
            <div className="relative group">
                <select 
                    className={selectClass}
                    value={selectedRubro}
                    onChange={(e) => setSelectedRubro(e.target.value)}
                >
                    <option value="All">Todos los Rubros</option>
                    {RUBROS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div className="relative group">
                <select 
                    className={selectClass}
                    value={selectedEntity}
                    onChange={(e) => setSelectedEntity(e.target.value)}
                >
                    <option value="All">Todas las Entidades</option>
                    {entities.map(e => <option key={e.id} value={e.id}>{e.business_name}</option>)}
                </select>
            </div>

            {(selectedRubro !== 'All' || selectedEntity !== 'All') && (
                <button 
                    onClick={() => { setSelectedRubro('All'); setSelectedEntity('All'); }}
                    className="text-[10px] font-black text-emerald-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                    <XCircle size={12} /> Limpiar Filtros
                </button>
            )}
          </div>
      </div>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl relative min-h-[400px] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
            <tr>
              <th className="px-6 py-4 text-emerald-500/70">ID / Rubro</th>
              <th className="px-6 py-4">Entidad Solicitante</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Monto</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Estado / Expediente</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={7}><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : filteredBudgets.length > 0 ? (
              filteredBudgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">#{budget.custom_id || budget.id.slice(0, 5)}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-widest">{budget.rubro}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Building2 size={14} className="text-slate-600" />
                        {budget.entity?.business_name || 'Sin asignar'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 uppercase">
                    {new Date(budget.date + (budget.date.includes('T') ? '' : 'T12:00:00Z')).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                    {formatCurrency(budget.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] text-slate-400 font-medium max-w-[200px] truncate" title={budget.description}>
                        {(budget.description || '').replace(/^\[EMPRESA: .*?\]\n\n/, '') || '---'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit font-black text-[9px] tracking-widest uppercase ${
                            budget.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            budget.status === 'Rejected' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                            budget.status === 'Draft' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                            'bg-slate-700/50 text-slate-300 border border-slate-700/70'
                        }`}>
                            {budget.status === 'Approved' ? <CheckCircle2 size={12} /> : budget.status === 'Rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                            {budget.status === 'Approved' ? 'Aprobado' : budget.status === 'Rejected' ? 'Rechazado' : budget.status === 'Draft' ? 'Borrador' : budget.status}
                        </div>
                        {budget.approvals && budget.approvals[0]?.file_number && (
                            <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-black tracking-tighter">
                                <FileText size={12} /> EXP: {budget.approvals[0].file_number}
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionsMenu 
                      onEdit={() => {
                        setEditingBudget(budget);
                        setIsModalOpen(true);
                      }}
                      onDelete={() => handleDelete(budget.id)}
                      onApprove={budget.status !== 'Approved' ? () => handleUpdateStatus(budget.id, 'Approved') : undefined}
                      onReject={budget.status !== 'Rejected' ? () => handleUpdateStatus(budget.id, 'Rejected') : undefined}
                    />
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                    <td colSpan={7} className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs italic">
                        No se encontraron presupuestos.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
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

      {/* MODAL DE APROBACION - CARGA DE EXPEDIENTE */}
      <Modal 
        isOpen={isApprovalModalOpen} 
        onClose={() => setIsApprovalModalOpen(false)} 
        title="Aprobar Presupuesto"
      >
        <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <p className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                    <Receipt size={16} /> Estás aprobando este presupuesto.
                </p>
                <p className="text-slate-400 text-xs mt-1">Por favor, ingresa el número de expediente relacionado para completar el trámite.</p>
            </div>

            <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Número de Expediente</label>
                <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        required
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-bold text-lg"
                        placeholder="Ej: EXP-2026-XXXX"
                        value={approvalFileNumber}
                        onChange={(e) => setApprovalFileNumber(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <footer className="flex justify-end gap-3 pt-4">
                 <button
                    onClick={() => setIsApprovalModalOpen(false)}
                    className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    onClick={confirmApproval}
                    disabled={isApproving || !approvalFileNumber}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                    {isApproving ? 'Procesando...' : 'Confirmar Aprobación'}
                </button>
            </footer>
        </div>
      </Modal>
    </div>
  );
}
