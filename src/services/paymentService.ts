import { supabase } from '@/lib/supabase';

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  date: string;
  method: string;
  created_at: string;
}

export const paymentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        invoice:invoices(invoice_number, purchase_order:purchase_orders(po_number))
      `)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(payment: { invoice_id: string; amount: number; method?: string; date?: string }) {
    const { data, error } = await supabase
      .from('payments')
      .insert([{ ...payment, date: payment.date || new Date().toISOString(), method: payment.method || 'Transfer' }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, payment: Partial<Payment>) {
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
