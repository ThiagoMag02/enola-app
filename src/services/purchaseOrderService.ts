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
  tender?: any;
  approval?: any;
}

export const purchaseOrderService = {
  async getAll() {
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

  async create(po: { budget_id?: string; provider_id?: string; po_number: string; amount: number; description?: string }) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([{
        po_number: po.po_number,
        amount: po.amount,
        date: new Date().toISOString(),
        status: 'Pending'
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, po: Partial<PurchaseOrder>) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ ...po, status: po.status || 'Pending' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
