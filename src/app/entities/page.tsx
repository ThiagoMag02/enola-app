'use client';

import { useEffect, useState } from 'react';
import { entityService, Entity } from '@/services/entityService';
import { 
  Users, 
  Search, 
  Plus, 
  ExternalLink, 
  MoreVertical,
  Mail,
  Phone,
  Building2
} from 'lucide-react';

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    entityService.getAll()
      .then(setEntities)
      .finally(() => setLoading(false));
  }, []);

  const filteredEntities = entities.filter(e => 
    e.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.cuit.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Users className="text-blue-500" /> Entidades
          </h2>
          <p className="text-slate-400 mt-1">Gestión de Clientes y Proveedores del sistema.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20">
          <Plus size={20} /> Nueva Entidad
        </button>
      </header>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar por Razón Social o CUIT..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Razón Social / ID</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">CUIT</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6" colSpan={6}><div className="h-4 bg-slate-800 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredEntities.length > 0 ? (
                filteredEntities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase">{entity.business_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono tracking-tighter">{entity.id || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        entity.type === 'Client' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                        entity.type === 'Provider' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'bg-slate-700/50 text-slate-300'
                      }`}>
                        {entity.type === 'Client' ? 'Cliente' : entity.type === 'Provider' ? 'Proveedor' : 'Ambos'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-300">
                      {entity.cuit}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {entity.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Mail size={12} /> {entity.email}
                          </div>
                        )}
                        {entity.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Phone size={12} /> {entity.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${entity.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></span>
                        <span className="text-xs font-bold text-slate-300">{entity.is_active ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                    <Users size={40} className="mx-auto mb-4 opacity-10" />
                    No se encontraron entidades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
