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
  description: string;
  status: BudgetStatus;
  created_at: string;
  updated_at?: string;
}

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost');

const mockBudgets: any[] = [
  { id: '1', custom_id: 'B-001', rubro: 'Software', amount: 15000, status: 'Approved', date: new Date().toISOString() },
  { id: '2', custom_id: 'B-002', rubro: 'Hardware', amount: 5000, status: 'Draft', date: new Date().toISOString() },
];

export const budgetService = {
  async getAll() {
    if (isMockMode) return mockBudgets;
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        entity:entities!entity_id(*),
        provider:entities!provider_id(*)
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
        provider:entities!provider_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        ...budget,
        date: new Date().toISOString(),
        status: 'Draft'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, budget: Partial<Budget>) {
    const { data, error } = await supabase
      .from('budgets')
      .update({ 
        ...budget, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: BudgetStatus) {
    const { data, error } = await supabase
      .from('budgets')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
