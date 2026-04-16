'use client';

import { useEffect, useState, useMemo } from 'react';
import { checkService, Check } from '@/services/checkService';
import { entityService, Entity } from '@/services/entityService';
import { Modal } from '@/components/ui/Modal';
import { CheckForm } from '@/components/forms/CheckForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';
import { 
  Plus, 
  Wallet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Filter,
  Eye,
  Info
} from 'lucide-react';

export default function ChecksPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);

  // Filters
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterProviderId, setFilterProviderId] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Pendiente' | 'Pagado'>('Todos');

  const loadData = async () => {
    setLoading(true);
    try {
      const [checksData, entitiesData] = await Promise.all([
        checkService.getAll(),
        entityService.getAll()
      ]);
      setChecks(checksData);
      setEntities(entitiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cheque?')) return;
    try {
      await checkService.delete(id);
      loadData();
    } catch (err) {
      console.error('Error deleting check:', err);
      alert('No se pudo eliminar el cheque.');
    }
  };

  const handleToggleStatus = async (check: Check) => {
    try {
      const newStatus = check.status === 'Pendiente' ? 'Pagado' : 'Pendiente';
      await checkService.updateStatus(check.id, newStatus);
      loadData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al cambiar el estado.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and Calculate Cumulative values
  const { filteredChecks, totalPending, totalPaid } = useMemo(() => {
    let filtered = [...checks];

    // Status Filter
    if (filterStatus !== 'Todos') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    // Provider Filter
    if (filterProviderId) {
      filtered = filtered.filter(c => c.provider_id === filterProviderId);
    }

    // Date Filters (using due_date for logic but can be generic)
    if (filterStartDate) {
      filtered = filtered.filter(c => c.due_date >= filterStartDate);
    }
    if (filterEndDate) {
      filtered = filtered.filter(c => c.due_date <= filterEndDate);
    }

    // The query orders by due_date ASC. If the filtering messes it up, re-sort just in case.
    filtered.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    let acc = 0;
    let sumPending = 0;
    let sumPaid = 0;

    const checksWithAccumulated = filtered.map(c => {
      if (c.status === 'Pendiente') {
        acc += Number(c.amount);
        sumPending += Number(c.amount);
      } else {
        sumPaid += Number(c.amount);
      }
      return { ...c, accumulated: acc };
    });

    return { 
      filteredChecks: checksWithAccumulated,
      totalPending: sumPending,
      totalPaid: sumPaid
    };
  }, [checks, filterStartDate, filterEndDate, filterProviderId, filterStatus]);

  const getRowClassName = (check: Check) => {
    if (check.status === 'Pagado') return "opacity-60 saturate-50";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(check.due_date + 'T00:00:00'); // Ensure it parses as local without timezone offset issues if possible, or UTC as UTC
    
    // Convert to UTC ms to compare correctly ignoring timezone of the string if it's YYYY-MM-DD
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "bg-rose-950/20"; // Vencido
    } else if (diffDays <= 7) {
      return "bg-amber-950/20"; // Próximo a vencer
    }
    return "hover:bg-slate-800/30";
  };

  const getStatusBadge = (check: Check) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(check.due_date + 'T00:00:00');
    
    if (check.status === 'Pagado') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={12} /> Pagado
        </span>
      );
    }
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return (
         <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
          <AlertTriangle size={12} /> Vencido ({Math.abs(diffDays)}d)
        </span>
      );
    } else if (diffDays <= 7) {
      return (
         <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertCircle size={12} /> en {diffDays} días
        </span>
      );
    }

    return (
       <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-slate-700/30 text-slate-400 border border-slate-700/50">
        <AlertCircle size={12} /> Pendiente
      </span>
    );
  };

  return (
    <div className="p-8 space-y-8 animate-in zoom-in-95 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Wallet className="text-emerald-400" /> Cartera de Cheques
          </h2>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-black">Gestión de emisión, pagos y acumulado de deuda pendiente.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedCheck(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-emerald-600/20"
        >
          <Plus size={20} /> Agregar Cheque
        </button>
      </header>

      {/* KPI Cards and Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* KPI: Pending */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-rose-900/30 shadow-lg flex flex-col justify-between">
          <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <AlertCircle size={14} /> Total Pendiente
          </div>
          <div className="text-3xl font-bold text-white tracking-tighter">
            ${new Intl.NumberFormat('es-AR').format(totalPending)}
          </div>
        </div>

        {/* KPI: Paid */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-emerald-900/30 shadow-lg flex flex-col justify-between">
          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <CheckCircle2 size={14} /> Total Pagado
          </div>
          <div className="text-3xl font-bold text-white tracking-tighter">
            ${new Intl.NumberFormat('es-AR').format(totalPaid)}
          </div>
        </div>

        {/* FILTERS */}
        <div className="lg:col-span-2 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col gap-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Filter size={14} /> Filtros Combinados
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Status Filter */}
            <select
              className="bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Pagado">Pagado</option>
            </select>

            {/* Provider Filter */}
            <select
              className="bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
              value={filterProviderId}
              onChange={(e) => setFilterProviderId(e.target.value)}
            >
              <option value="">Todas las Empresas</option>
              {entities.map(e => <option key={e.id} value={e.id}>{e.business_name}</option>)}
            </select>

            {/* Date Filters */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group focus-within:ring-1 focus-within:ring-emerald-500">
              <input 
                type="date" 
                title="Desde Vencimiento"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full bg-transparent py-2 px-2 text-xs text-slate-300 outline-none border-r border-slate-800" 
              />
              <input 
                type="date" 
                title="Hasta Vencimiento"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full bg-transparent py-2 px-2 text-xs text-slate-300 outline-none" 
              />
            </div>
          </div>
        </div>

      </div>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl relative min-h-[300px] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-widest font-black whitespace-nowrap">
            <tr>
              <th className="px-6 py-4">Vencimiento</th>
              <th className="px-6 py-4">Emisión</th>
              <th className="px-6 py-4">N° Cheque</th>
              <th className="px-6 py-4">Empresa</th>
              <th className="px-6 py-4 text-right">Importe</th>
              <th className="px-6 py-4 text-right">Acumulado</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4">Observaciones</th>
              <th className="px-6 py-4 text-center">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-6" colSpan={9}><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : filteredChecks.length > 0 ? (
              filteredChecks.map((check: any) => (
                <tr key={check.id} className={`transition-colors group ${getRowClassName(check)}`}>
                  
                  {/* Vencimiento */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {new Date(check.due_date + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>

                  {/* Emisión */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-slate-500 font-medium">
                      {new Date(check.issue_date + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>

                  {/* Nro Cheque */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-slate-300 font-mono">
                      #{check.check_number}
                    </div>
                  </td>

                  {/* Empresa */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-[150px]">
                      <Building2 size={14} className="text-slate-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-200 truncate" title={check.provider?.business_name || 'Desconocido'}>
                        {check.provider?.business_name || 'Desconocido'}
                      </span>
                    </div>
                  </td>

                  {/* Importe */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className={`font-mono font-bold text-sm ${check.status === 'Pendiente' ? 'text-white' : 'text-slate-500 line-through decoration-slate-600'}`}>
                      ${new Intl.NumberFormat('es-AR').format(check.amount)}
                    </div>
                  </td>

                  {/* Acumulado */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="font-mono font-black text-base text-rose-400/90 tracking-tighter">
                      {check.status === 'Pendiente' ? `$${new Intl.NumberFormat('es-AR').format(check.accumulated)}` : '-'}
                    </div>
                  </td>

                  {/* Estado (Click to change via actions could be better, or clicking here) */}
                  <td className="px-6 py-4 flex justify-center mt-2 cursor-pointer" onClick={() => handleToggleStatus(check)} title="Cambiar Estado">
                    {getStatusBadge(check)}
                  </td>

                  {/* Observaciones */}
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-400 font-medium max-w-[150px] truncate" title={check.observations}>
                      {check.observations || <span className="italic opacity-50">Sin obs.</span>}
                    </div>
                  </td>

                  {/* Detalles y Acciones */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => {
                          setSelectedCheck(check);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1 bg-blue-500/10 rounded-lg hover:bg-blue-500/20"
                        title="Ver Detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <ActionsMenu 
                        onEdit={() => {
                          setSelectedCheck(check);
                          setIsFormModalOpen(true);
                        }}
                        onDelete={() => handleDelete(check.id)}
                      />
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr><td colSpan={9} className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs italic">No hay cheques que coincidan con los filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCheck(null);
        }} 
        title={selectedCheck ? "Editar Cheque" : "Registrar Nuevo Cheque"}
      >
        <CheckForm 
          initialData={selectedCheck}
          onSuccess={() => {
            setIsFormModalOpen(false);
            setSelectedCheck(null);
            loadData();
          }} 
          onCancel={() => {
            setIsFormModalOpen(false);
            setSelectedCheck(null);
          }} 
        />
      </Modal>

      {/* DETAILS MODAL */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCheck(null);
        }} 
        title="Detalle Completo del Cheque"
      >
        {selectedCheck && (
           <div className="space-y-6 text-slate-200 p-2">
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Empresa Pagada</p>
                 <p className="font-bold flex items-center gap-2">
                    <Building2 size={16} className="text-slate-400" />
                    {selectedCheck.provider?.business_name || 'Desconocido'}
                  </p>
               </div>
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Importe</p>
                 <p className="font-bold font-mono text-emerald-400">${new Intl.NumberFormat('es-AR').format(selectedCheck.amount)}</p>
               </div>
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Fecha Emisión</p>
                 <p className="font-bold">
                    {new Date(selectedCheck.issue_date + 'T00:00:00').toLocaleDateString('es-AR')}
                 </p>
               </div>
               <div className="bg-slate-900/50 p-4 rounded-xl border border-rose-900/30">
                 <p className="text-[10px] text-rose-500/70 font-black uppercase tracking-widest mb-1">Fecha Vencimiento</p>
                 <p className="font-bold text-rose-400">
                    {new Date(selectedCheck.due_date + 'T00:00:00').toLocaleDateString('es-AR')}
                 </p>
               </div>
             </div>

             <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Observaciones (Resumen)</p>
                  <p className="text-sm font-medium">{selectedCheck.observations || <span className="italic text-slate-600">Sin observaciones</span>}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Concepto / Recordatorio Extendido</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedCheck.details || <span className="italic text-slate-600">No hay concepto detallado</span>}</p>
                </div>
             </div>
           </div>
        )}
      </Modal>

    </div>
  );
}
