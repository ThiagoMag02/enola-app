'use client';

import { useEffect, useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  FileDown,
  Hash,
  Calendar,
  Layers,
  Building
} from 'lucide-react';
import { costCenterService, CostCenter } from '@/services/costCenterService';
import { Modal } from '@/components/ui/Modal';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { CostCenterForm } from '@/components/forms/CostCenterForm';
import { ActionsMenu } from '@/components/ui/ActionsMenu';

export default function CompanyPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState<'company' | 'cost_center' | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  const loadData = () => {
    setLoading(true);
    costCenterService.getAll()
      .then(setCostCenters)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = costCenters.filter(cc => 
    `${cc.name} ${cc.number} ${cc.company?.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 h-screen flex flex-col space-y-8 animate-in zoom-in-95 duration-500 overflow-hidden">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Building2 className="text-blue-400" /> Empresa
          </h2>
          <p className="text-slate-400 mt-1 uppercase tracking-widest text-[10px] font-black">
            Gestión de comitentes y centros de costos asociados.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-48"
            />
          </div>
          <button 
            onClick={() => {
              setEditingData(null);
              setModalType('company');
            }}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
          >
            <Building size={18} /> Nueva Empresa
          </button>
          <button 
            onClick={() => {
              setEditingData(null);
              setModalType('cost_center');
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} /> Nuevo Centro
          </button>
        </div>
      </header>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 shadow-2xl relative flex-1 overflow-hidden">
        <div className="h-full overflow-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800 sticky top-0 z-20 text-slate-400 text-[10px] uppercase tracking-widest font-black shadow-md">
              <tr>
                <th className="px-6 py-4">Ref / Año</th>
                <th className="px-6 py-4">Comitente (Empresa)</th>
                <th className="px-6 py-4">CUIT</th>
                <th className="px-6 py-4">Centro de Costo</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white group-hover:text-blue-400 transition-colors flex items-center gap-1">
                          <Hash size={12} className="text-slate-500" />
                          {item.number}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <Calendar size={10} />
                          AÑO: {item.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-200">{item.company?.name || 'S/N'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                        {item.company?.cuit || '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-tight">
                        <Layers size={14} />
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionsMenu 
                        onEdit={() => {
                          setEditingData(item);
                          setModalType('cost_center');
                        }}
                        onDelete={async () => {
                          if (confirm('¿Desea eliminar este centro de costo?')) {
                            await costCenterService.delete(item.id);
                            loadData();
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-slate-500 italic font-bold">No se encontraron datos.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalType !== null}
        onClose={() => {
          setModalType(null);
          setEditingData(null);
        }}
        title={
          modalType === 'company' 
            ? (editingData ? "Editar Empresa" : "Nueva Empresa") 
            : (editingData ? "Editar Centro de Costo" : "Nuevo Centro de Costo")
        }
      >
        {modalType === 'company' ? (
          <CompanyForm 
            initialData={editingData}
            onSuccess={() => {
              setModalType(null);
              loadData();
            }}
            onCancel={() => setModalType(null)}
          />
        ) : (
          <CostCenterForm 
            initialData={editingData}
            onSuccess={() => {
              setModalType(null);
              loadData();
            }}
            onCancel={() => setModalType(null)}
          />
        )}
      </Modal>
    </div>
  );
}
