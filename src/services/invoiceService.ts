import { supabase } from '@/lib/supabase';

export type InvoiceStatus = 'Pending' | 'Paid';

export interface Invoice {
  id: string;
  purchase_order_id: string;
  invoice_number: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
  description?: string;
  created_at: string;
  purchase_order?: any;
}

export const invoiceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        purchase_order:purchase_orders(*),
        payments(amount)
      `)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        purchase_order:purchase_orders(*),
        payments(amount)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(invoice: { purchase_order_id: string; invoice_number: string; amount: number; date?: string; status?: InvoiceStatus; description?: string }) {
    const { data, error } = await supabase
      .from('invoices')
      .insert([{ ...invoice, date: invoice.date || new Date().toISOString(), status: invoice.status || 'Pending' }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, invoice: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
