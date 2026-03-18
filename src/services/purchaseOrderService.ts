import { supabase } from '@/lib/supabase';

export type PurchaseOrderStatus = 'Pending' | 'Partial' | 'Billed' | 'Cancelled';

export interface PurchaseOrder {
  id: string;
  tender_id?: string;
  approval_id?: string;
  po_number: string;
  amount: number;
  date: string;
  status: PurchaseOrderStatus;
  created_at: string;
}

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost');

const mockPOs: any[] = [
  { id: '1', po_number: 'PO-2026-001', amount: 15000, status: 'Pending', date: new Date().toISOString() },
];

export const purchaseOrderService = {
  async getAll() {
    if (isMockMode) return mockPOs;
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        tender:tenders(*),
        approval:approvals(*)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        tender:tenders(*),
        approval:approvals(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(po: Omit<PurchaseOrder, 'id' | 'created_at' | 'status' | 'date'>) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([{
        ...po,
        date: new Date().toISOString(),
        status: 'Pending'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
