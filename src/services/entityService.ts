import { supabase } from '@/lib/supabase';

export type EntityType = 'Client' | 'Provider' | 'Both';

export interface Entity {
  id: string;
  custom_id?: string;
  type: EntityType;
  cuit: string;
  business_name: string;
  fantasy_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  cbu?: string;
  bank_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export const entityService = {
  async getAll(): Promise<Entity[]> {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('is_active', true)
      .order('business_name', { ascending: true });
    if (error) throw error;
    return data as Entity[];
  },

  async getById(id: string): Promise<Entity> {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Entity;
  },

  async create(entity: Omit<Entity, 'id' | 'created_at' | 'updated_at'>): Promise<Entity> {
    const { data, error } = await supabase
      .from('entities')
      .insert([entity])
      .select()
      .single();
    if (error) throw error;
    return data as Entity;
  },

  async update(id: string, entity: Partial<Entity>): Promise<Entity> {
    const { data, error } = await supabase
      .from('entities')
      .update({ ...entity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Entity;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('entities')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
