import { supabase } from '@/lib/supabase';

export type CheckStatus = 'Pendiente' | 'Pagado';

export interface Check {
  id: string;
  issue_date: string;
  due_date: string;
  check_number: string;
  provider_id: string;
  amount: number;
  status: CheckStatus;
  observations?: string;
  details?: string;
  created_at: string;
  updated_at?: string;
  provider?: any;
}

export const checkService = {
  async getAll() {
    const { data, error } = await supabase
      .from('checks')
      .select(`
        *,
        provider:entities!provider_id(*)
      `)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('checks')
      .select(`
        *,
        provider:entities!provider_id(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(check: Omit<Check, 'id' | 'created_at' | 'updated_at' | 'provider'>) {
    const { data, error } = await supabase
      .from('checks')
      .insert([{ ...check, status: check.status || 'Pendiente' }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, check: Partial<Check>) {
    const { data, error } = await supabase
      .from('checks')
      .update({ ...check, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: CheckStatus) {
    const { data, error } = await supabase
      .from('checks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error, data, count } = await supabase
      .from('checks')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`checkService DELETE error:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn(`checkService DELETE warning: 0 rows affected.`);
      throw new Error("No se pudo eliminar el registro en la base de datos.");
    }
    
    return true;
  }
};
