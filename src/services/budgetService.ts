import { supabase } from '@/lib/supabase';

export type BudgetStatus = 'Draft' | 'Delivered' | 'Approved' | 'Rejected' | 'Cancelled';

export interface Budget {
  id: string;
  custom_id?: string;
  date: string;
  entity_id: string;
  provider_id?: string;
  rubro: string;
  amount: number;
  description?: string;
  status: BudgetStatus;
  approvals?: any[]; // Joined data
  file_number?: string; // We'll map this from approvals manually if needed or via transform
  created_at: string;
  updated_at?: string;
  entity?: any;
  provider?: any;
}

export const budgetService = {
  async getAll() {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        entity:entities!entity_id(*),
        provider:entities!provider_id(*),
        approvals(file_number)
      `)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        entity:entities!entity_id(*),
        provider:entities!provider_id(*),
        approvals(file_number)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'entity' | 'provider'>) {
    const { data, error } = await supabase
      .from('budgets')
      .insert([{ ...budget, date: budget.date || new Date().toISOString().split('T')[0], status: budget.status || 'Draft' }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, budget: Partial<Budget>) {
    const { data, error } = await supabase
      .from('budgets')
      .update({ ...budget, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: BudgetStatus) {
    const { data, error } = await supabase
      .from('budgets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    console.log(`budgetService: attempting to DELETE budget with ID ${id}`);
    const { error, data, count } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .select();
    
    console.log(`budgetService DELETE response:`, { error, data, count });
    
    if (error) {
      console.error(`budgetService DELETE error:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn(`budgetService DELETE warning: 0 rows affected. Posible falta de permisos (RLS) o el registro ya no existe.`);
      throw new Error("No se pudo eliminar el registro en la base de datos (Posible bloqueo por permisos RLS).");
    }
    
    return true;
  }
};
