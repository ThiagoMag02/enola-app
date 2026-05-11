'use client';

import { useEffect, useState } from 'react';
import { 
  UserRound, 
  Search, 
  Plus, 
  FileDown,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Filter,
  X,
  Building,
  Layers
} from 'lucide-react';
import { employeeService, Employee } from '@/services/employeeService';
import { companyService, Company } from '@/services/companyService';
import { costCenterService, CostCenter } from '@/services/costCenterService';
import { Modal } from '@/components/ui/Modal';
import { EmployeeForm } from '@/components/forms/EmployeeForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';

export default function PersonnelPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCostCenter, setSelectedCostCenter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, compData, ccData] = await Promise.all([
        employeeService.getAll(),
        companyService.getAll(),
        costCenterService.getAll()
      ]);
      setEmployees(empData);
      setCompanies(compData);
      setCostCenters(ccData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeactivate = async (id: string) => {
    const reason = prompt('Por favor, ingrese el motivo de la baja:');
    if (!reason) return;

    try {
      await employeeService.deactivateEmployee(id, reason);
      loadData();
    } catch (err) {
      console.error('Error deactivating employee:', err);
      alert('No se pudo procesar la baja.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setSelectedCompany('');
    setSelectedCostCenter('');
  };

  const filteredEmployees = employees.filter(e => {
    // Filtro de búsqueda texto
    const matchesSearch = `${e.first_name} ${e.last_name} ${e.cuil}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de fechas (Fecha Ingreso)
    const matchesDateFrom = !dateFrom || (e.hire_date && e.hire_date >= dateFrom);
    const matchesDateTo = !dateTo || (e.hire_date && e.hire_date <= dateTo);
    
    // Filtro de Empresa
    const matchesCompany = !selectedCompany || e.cost_center?.company_id === selectedCompany;
    
    // Filtro de Centro de Costo
    const matchesCostCenter = !selectedCostCenter || e.cost_center_id === selectedCostCenter;

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesCompany && matchesCostCenter;
  });

  const filterSelectClass = "bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer min-w-[140px]";
  const filterLabelClass = "text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1 flex items-center gap-1";

  return (
    <div className="p-8 h-screen flex flex-col space-y-6 animate-in zoom-in-95 duration-500 overflow-hidden">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <UserRound className="text-blue-400" /> Nómina de Personal
          </h2>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-black">
            Gestión centralizada de empleados y datos administrativos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg">
            <FileDown size={18} /> PDF
          </button>
          <button 
            onClick={() => {
              setEditingEmployee(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} /> Nuevo Empleado
          </button>
        </div>
      </header>

      {/* Barra de Filtros */}
      <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className={filterLabelClass}><Search size={10} /> Buscar</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Nombre o CUIL..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white pl-3 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className={filterLabelClass}><Building size={10} /> Empresa</label>
          <select 
            className={filterSelectClass}
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">Todas</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className={filterLabelClass}><Layers size={10} /> Centro de Costo</label>
          <select 
            className={filterSelectClass}
            value={selectedCostCenter}
            onChange={(e) => setSelectedCostCenter(e.target.value)}
          >
            <option value="">Todos</option>
            {costCenters
              .filter(cc => !selectedCompany || cc.company_id === selectedCompany)
              .map(cc => <option key={cc.id} value={cc.id}>{cc.name}</option>)
            }
          </select>
        </div>

        <div>
          <label className={filterLabelClass}><Calendar size={10} /> Ingreso Desde</label>
          <input 
            type="date" 
            className={filterSelectClass}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div>
          <label className={filterLabelClass}><Calendar size={10} /> Ingreso Hasta</label>
          <input 
            type="date" 
            className={filterSelectClass}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <button 
          onClick={clearFilters}
          className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-all"
          title="Limpiar filtros"
        >
          <X size={18} />
        </button>
      </div>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl relative flex-1 overflow-hidden">
        <div className="h-full overflow-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead className="bg-slate-800 sticky top-0 z-20 text-slate-400 text-[10px] uppercase tracking-widest font-black shadow-md">
              <tr>
                <th className="px-6 py-4">Empleado / CUIL</th>
                <th className="px-6 py-4">Centro de Costo</th>
                <th className="px-6 py-4">Dirección</th>
                <th className="px-6 py-4">Contacto / Banco</th>
                <th className="px-6 py-4">Convenio / Cat.</th>
                <th className="px-6 py-4">Carnet</th>
                <th className="px-6 py-4">Fechas / Antig.</th>
                <th className="px-6 py-4">Estado / Baja</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="px-6 py-8"><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                          {person.first_name[0]}{person.last_name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                            {person.last_name}, {person.first_name}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-bold">CUIL: {person.cuil}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 w-fit">
                          {person.cost_center?.name || 'S/N'}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase">
                          {person.cost_center?.company?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          <MapPin size={12} className="text-slate-500" />
                          {person.street || '---'}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase font-black">
                          {person.city || '---'} {person.postal_code ? `(CP: ${person.postal_code})` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          <Phone size={12} className="text-slate-500" />
                          {person.phone || '---'}
                        </span>
                        <span className="text-[9px] text-blue-400 font-black flex items-center gap-1">
                          <CreditCard size={10} />
                          {person.bank || '---'} {person.cbu ? `- ${person.cbu.slice(-4)}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300">{person.agreement || '---'}</span>
                        <span className="text-[9px] text-slate-500 uppercase font-black">{person.category || '---'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300">{person.license_card || 'N/A'}</span>
                        <span className="text-[9px] text-amber-400 font-bold">Vence: {person.license_card_expiration || '---'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                          <Calendar size={12} className="text-slate-500" />
                          Ingreso: {person.hire_date || '---'}
                        </span>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">
                          {person.seniority || '---'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border w-fit ${
                          person.status === 'ACTIVE' 
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                            : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}>
                          {person.status}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                          {person.employment_status}
                        </span>
                        {person.status === 'INACTIVE' && (
                          <span className="text-[9px] text-rose-500/70 italic max-w-[120px] truncate" title={person.termination_reason || ''}>
                            {person.termination_reason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu 
                        onEdit={() => {
                          setEditingEmployee(person);
                          setIsModalOpen(true);
                        }}
                        onDelete={() => handleDeactivate(person.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <p className="text-slate-500 italic font-bold">No se encontraron empleados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        title={editingEmployee ? "Editar Empleado" : "Registrar Nuevo Empleado"}
      >
        <EmployeeForm 
          initialData={editingEmployee}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingEmployee(null);
            loadData();
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEmployee(null);
          }}
        />
      </Modal>
    </div>
  );
}
