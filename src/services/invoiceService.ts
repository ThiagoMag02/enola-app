import { supabase } from '@/lib/supabase';

export type InvoiceStatus = 'Pending' | 'Paid';

export interface Invoice {
  id: string;
  purchase_order_id: string;
  invoice_number: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
  created_at: string;
}

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost');

const mockInvoices: any[] = [
  { id: '1', invoice_number: 'FAC-001', amount: 5000, date: new Date().toISOString(), status: 'Pending', purchase_order: { po_number: 'PO-001' } },
  { id: '2', invoice_number: 'FAC-002', amount: 15000, date: new Date().toISOString(), status: 'Paid', purchase_order: { po_number: 'PO-2026-001' } },
];

export const invoiceService = {
  async getAll() {
    if (isMockMode) return mockInvoices;
    const { data, error } = await supabase
      .from('invoices')
      .select('*, purchase_order:purchase_orders(*)')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, purchase_order:purchase_orders(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(invoice: Omit<Invoice, 'id' | 'created_at' | 'status' | 'date'>) {
    // Start a transaction-like flow (though Supabase/PostgREST doesn't support multi-table transactions easily without RPC)
    // We'll use a simple sequential approach or suggest a stored procedure (RPC) for production
    
    const { data: newInvoice, error: invError } = await supabase
      .from('invoices')
      .insert([{
        ...invoice,
        date: new Date().toISOString(),
        status: 'Pending'
      }])
      .select()
      .single();
    
    if (invError) throw invError;

    // Logic to update PO status (matching C# service)
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .select('amount')
      .eq('id', invoice.purchase_order_id)
      .single();

    if (!poError && po) {
      const newStatus = invoice.amount >= po.amount ? 'Billed' : 'Partial';
      await supabase
        .from('purchase_orders')
        .update({ status: newStatus })
        .eq('id', invoice.purchase_order_id);
    }

    return newInvoice;
  }
};
