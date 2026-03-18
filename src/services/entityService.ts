import { supabase } from '@/lib/supabase';

export type EntityType = 'Client' | 'Provider' | 'Both';

export interface Entity {
  id: string;
  custom_id: string;
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

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost');

const mockEntities: Entity[] = [
  { id: '1', custom_id: '2026020001', type: 'Client', cuit: '30711111118', business_name: 'Tech Solutions S.A.', is_active: true, created_at: new Date().toISOString() },
  { id: '2', custom_id: '2026020002', type: 'Provider', cuit: '30722222228', business_name: 'Global Supply SRL', fantasy_name: 'Global Logística', is_active: true, created_at: new Date().toISOString() },
  { id: '3', custom_id: '2026020003', type: 'Both', cuit: '30733333338', business_name: 'Constructora del Sur', city: 'Buenos Aires', is_active: true, created_at: new Date().toISOString() },
];

export const entityService = {
  async getAll() {
    if (isMockMode) return mockEntities;
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('is_active', true)
      .order('business_name', { ascending: true });
    
    if (error) throw error;
    return data as Entity[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Entity;
  },

  async create(entity: Omit<Entity, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('entities')
      .insert([entity])
      .select()
      .single();
    
    if (error) throw error;
    return data as Entity;
  },

  async update(id: string, entity: Partial<Entity>) {
    const { data, error } = await supabase
      .from('entities')
      .update({ ...entity, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Entity;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('entities')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};
