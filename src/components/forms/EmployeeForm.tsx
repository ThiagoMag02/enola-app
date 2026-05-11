'use client';

import { useState, useEffect } from 'react';
import { employeeService, Employee, EmployeeStatus, EmploymentStatus } from '@/services/employeeService';
import { costCenterService, CostCenter } from '@/services/costCenterService';
import { companyService, Company } from '@/services/companyService';
import { 
  UserRound, 
  Hash, 
  MapPin, 
  Phone, 
  CreditCard, 
  Building, 
  Calendar, 
  Briefcase,
  Loader2, 
  Save, 
  X,
  AlertCircle
} from 'lucide-react';

interface EmployeeFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EmployeeForm = ({ initialData, onSuccess, onCancel }: EmployeeFormProps) => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [filteredCostCenters, setFilteredCostCenters] = useState<CostCenter[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialData?.cost_center?.company_id || '');
  const [cuilStatus, setCuilStatus] = useState<{ exists: boolean; data?: any } | null>(null);
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    employee_code: initialData?.employee_code || '',
    cost_center_id: initialData?.cost_center_id || '',
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    cuil: initialData?.cuil || '',
    street: initialData?.street || '',
    city: initialData?.city || '',
    postal_code: initialData?.postal_code || '',
    phone: initialData?.phone || '',
    cbu: initialData?.cbu || '',
    bank: initialData?.bank || '',
    agreement: initialData?.agreement || '',
    category: initialData?.category || '',
    license_card: initialData?.license_card || '',
    license_card_expiration: initialData?.license_card_expiration || '',
    hire_date: initialData?.hire_date || '',
    seniority: initialData?.seniority || '',
    status: initialData?.status || 'ACTIVE',
    employment_status: initialData?.employment_status || 'WORKING',
  });

  useEffect(() => {
    Promise.all([
      companyService.getAll(),
      costCenterService.getAll()
    ]).then(([compData, ccData]) => {
      setCompanies(compData);
      setCostCenters(ccData);
      
      // If editing, filter CCs for the initial company
      if (initialData?.cost_center?.company_id) {
        setFilteredCostCenters(ccData.filter((cc: CostCenter) => cc.company_id === initialData.cost_center.company_id));
      }
    }).catch(console.error);
  }, []);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setFormData(prev => ({ ...prev, cost_center_id: '' })); // Clear CC
    if (companyId) {
      setFilteredCostCenters(costCenters.filter((cc: CostCenter) => cc.company_id === companyId));
    } else {
      setFilteredCostCenters([]);
    }
  };

  const handleCuilBlur = async () => {
    if (!formData.cuil || initialData?.id) return;
    try {
      const existing = await employeeService.findByCuil(formData.cuil);
      if (existing) {
        setCuilStatus({ exists: true, data: existing });
      } else {
        setCuilStatus({ exists: false });
      }
    } catch (error) {
      console.error('Error checking CUIL:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cost_center_id) {
      alert("Debe seleccionar un Centro de Costo");
      return;
    }
    setLoading(true);
    try {
      if (initialData?.id) {
        await employeeService.update(initialData.id, formData);
      } else {
        await employeeService.createOrReactivateEmployee(formData);
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      alert(error.message || 'Error al guardar el empleado.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium text-sm";
  const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";
  const selectClass = "w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const isBlocked = cuilStatus?.exists && (cuilStatus.data.status === 'ACTIVE' || cuilStatus.data.employment_status === 'ON_LEAVE');

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
      {cuilStatus?.exists && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border ${isBlocked ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <div className="text-sm">
            <p className="font-bold">CUIL ya registrado en el sistema</p>
            <p className="opacity-80">{cuilStatus.data.first_name} {cuilStatus.data.last_name} - Estado: {cuilStatus.data.status}</p>
            {isBlocked ? (
              <p className="mt-1 font-black uppercase text-[10px]">No se puede duplicar un empleado activo.</p>
            ) : (
              <p className="mt-1 font-black uppercase text-[10px]">Al guardar, el empleado será REACTIVADO.</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identificación */}
        <div className="md:col-span-2">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] border-b border-slate-800 pb-2 mb-4">Datos Personales</h3>
        </div>

        <div>
          <label className={labelClass}>ID Interno (Legajo)</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              readOnly
              className={`${inputClass} bg-slate-900/50 text-slate-500 cursor-not-allowed`}
              placeholder="AUTO"
              value={formData.employee_code || (initialData?.id ? '' : 'GENERACIÓN AUTOMÁTICA')}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>CUIL (Sin guiones)</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              disabled={!!initialData?.id}
              className={inputClass}
              placeholder="Ej: 20304567892"
              value={formData.cuil}
              onBlur={handleCuilBlur}
              onChange={(e) => setFormData({ ...formData, cuil: e.target.value.replace(/\D/g, '') })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Nombre</label>
          <div className="relative">
            <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              className={inputClass}
              placeholder="Ej: Juan"
              value={formData.first_name || ''}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Apellido</label>
          <div className="relative">
            <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              required
              className={inputClass}
              placeholder="Ej: Pérez"
              value={formData.last_name || ''}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
        </div>

        {/* Laboral */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] border-b border-slate-800 pb-2 mb-4">Información Laboral</h3>
        </div>

        <div>
          <label className={labelClass}>Empresa / Comitente</label>
          <select 
            required
            className={selectClass}
            value={selectedCompanyId}
            onChange={(e) => handleCompanyChange(e.target.value)}
          >
            <option value="" className="bg-slate-900">Seleccionar empresa...</option>
            {companies.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Centro de Costo</label>
          <select 
            required
            disabled={!selectedCompanyId}
            className={selectClass}
            value={formData.cost_center_id || ''}
            onChange={(e) => setFormData({ ...formData, cost_center_id: e.target.value })}
          >
            <option value="" className="bg-slate-900">
              {!selectedCompanyId ? 'Primero seleccione empresa' : 'Seleccionar centro...'}
            </option>
            {filteredCostCenters.map(cc => (
              <option key={cc.id} value={cc.id} className="bg-slate-900">
                {cc.name} ({cc.number})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Fecha Ingreso</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="date"
              className={inputClass}
              value={formData.hire_date || ''}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Convenio</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="Ej: UOCRA"
              value={formData.agreement || ''}
              onChange={(e) => setFormData({ ...formData, agreement: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Categoría</label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="Ej: Oficial"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
        </div>

        {/* Bancario */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] border-b border-slate-800 pb-2 mb-4">Datos Bancarios</h3>
        </div>

        <div>
          <label className={labelClass}>Banco</label>
          <div className="relative">
            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="Ej: Banco Galicia"
              value={formData.bank || ''}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>CBU (22 dígitos)</label>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="Ej: 0070001234567890123456"
              maxLength={22}
              value={formData.cbu || ''}
              onChange={(e) => setFormData({ ...formData, cbu: e.target.value.replace(/\D/g, '') })}
            />
          </div>
        </div>

        {/* Domicilio / Contacto */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] border-b border-slate-800 pb-2 mb-4">Domicilio y Contacto</h3>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Calle y Número</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="Av. Santa Fe 1234"
              value={formData.street || ''}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Localidad</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="CABA"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Teléfono</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              className={inputClass}
              placeholder="11 1234 5678"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
      </div>

      <footer className="pt-8 flex justify-end gap-4 mt-8 sticky bottom-0 bg-slate-900 pb-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all flex items-center gap-2"
        >
          <X size={18} /> Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || isBlocked}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {initialData ? 'Actualizar' : isBlocked ? 'CUIL Bloqueado' : cuilStatus?.exists ? 'Reactivar' : 'Guardar'}</>}
        </button>
      </footer>
    </form>
  );
};
