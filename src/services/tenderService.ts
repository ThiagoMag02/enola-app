import { supabase } from '@/lib/supabase';

export interface Tender {
  id: string;
  budget_id: string;
  tender_number: string;
  offer_amount: number;
  tender_date: string;
  file_number?: string;
  created_at: string;
  budget?: any;
}

export const tenderService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tenders')
      .select(`*, budget:budgets(*)`)
      .order('tender_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tenders')
      .select(`*, budget:budgets(*)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(tender: { budget_id: string; tender_number: string; offer_amount: number; file_number?: string; tender_date?: string }) {
    const { data, error } = await supabase
      .from('tenders')
      .insert([{ ...tender, tender_date: tender.tender_date || new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, tender: Partial<Tender>) {
    const { data, error } = await supabase
      .from('tenders')
      .update(tender)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('tenders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
