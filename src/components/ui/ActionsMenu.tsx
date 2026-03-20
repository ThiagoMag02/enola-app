'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface ActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const ActionsMenu = ({ onEdit, onDelete }: ActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
      >
        <MoreVertical size={18} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Pencil size={16} className="text-blue-500" /> Editar
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("ActionsMenu: Trash button clicked!");
              if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
                console.log("ActionsMenu: User confirmed, calling onDelete()");
                onDelete();
              } else {
                console.log("ActionsMenu: User cancelled confirm.");
              }
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
};
