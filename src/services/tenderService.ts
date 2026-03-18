import { supabase } from '@/lib/supabase';

export interface Tender {
  id: string;
  budget_id: string;
  tender_number: string;
  offer_amount: number;
  tender_date: string;
  file_number?: string;
  created_at: string;
}

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost');

const mockTenders: any[] = [
  { id: '1', tender_number: 'LIC-001', offer_amount: 14500, tender_date: new Date().toISOString(), budget: { custom_id: 'B-001' } },
];

export const tenderService = {
  async getAll() {
    if (isMockMode) return mockTenders;
    const { data, error } = await supabase
      .from('tenders')
      .select('*, budget:budgets(*)')
      .order('tender_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getByBudget(budgetId: string) {
    const { data, error } = await supabase
      .from('tenders')
      .select('*, budget:budgets(*)')
      .eq('budget_id', budgetId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(tender: Omit<Tender, 'id' | 'created_at' | 'tender_date'>) {
    const { data, error } = await supabase
      .from('tenders')
      .insert([{
        ...tender,
        tender_date: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
