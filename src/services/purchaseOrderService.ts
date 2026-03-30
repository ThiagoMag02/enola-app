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
        approval:approvals(*),
        invoices(amount)
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
        approval:approvals(*),
        invoices(amount)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(po: { tender_id?: string; po_number: string; amount: number; date?: string }) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([{
        tender_id: po.tender_id || null,
        po_number: po.po_number,
        amount: po.amount,
        date: po.date || new Date().toISOString(),
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
