import { supabase } from '@/lib/supabase';

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  date: string;
  method: string;
  created_at: string;
}

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost');

const mockPayments: any[] = [
  { id: '1', invoice_id: 'FAC-002', amount: 15000, date: new Date().toISOString(), method: 'Transferencia Bancaria' },
];

export const paymentService = {
  async getAll() {
    if (isMockMode) return mockPayments;
    const { data, error } = await supabase
      .from('payments')
      .select('*, invoice:invoices(*)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(payment: Omit<Payment, 'id' | 'created_at' | 'date'>) {
    const { data: newPayment, error: payError } = await supabase
      .from('payments')
      .insert([{
        ...payment,
        date: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (payError) throw payError;

    // Update Invoice status (matching C# service)
    await supabase
      .from('invoices')
      .update({ status: 'Paid' })
      .eq('id', payment.invoice_id);

    return newPayment;
  }
};
