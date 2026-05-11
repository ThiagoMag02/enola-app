import { supabase } from '@/lib/supabase';

export interface CostCenter {
  id: string;
  company_id: string;
  number: string;
  year: string;
  name: string;
  created_at: string;
  updated_at?: string;
  company?: any; // Joined data
}

export const costCenterService = {
  async getAll() {
    const { data, error } = await supabase
      .from('cost_centers')
      .select('*, company:companies(*)')
      .order('year', { ascending: false })
      .order('number', { ascending: false });
    if (error) throw error;
    return data;
  },

  async listByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('cost_centers')
      .select('*')
      .eq('company_id', companyId)
      .order('number', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getByCompanyId(companyId: string) {
    return this.listByCompany(companyId);
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('cost_centers')
      .select('*, company:companies(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(costCenter: Omit<CostCenter, 'id' | 'created_at' | 'updated_at' | 'company' | 'number'> & { number?: string }) {
    let nextNumber = costCenter.number;

    if (!nextNumber) {
      // Auto-generate number (max + 1)
      const { data: lastCC } = await supabase
        .from('cost_centers')
        .select('number')
        .order('number', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const lastNum = lastCC ? parseInt(lastCC.number) : 0;
      nextNumber = (lastNum + 1).toString().padStart(3, '0');
    }

    const { data, error } = await supabase
      .from('cost_centers')
      .insert([{ ...costCenter, number: nextNumber }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, costCenter: Partial<CostCenter>) {
    const { data, error } = await supabase
      .from('cost_centers')
      .update({ ...costCenter, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('cost_centers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
