import { supabase } from '@/lib/supabase';

export interface Approval {
  id: string;
  budget_id: string;
  approval_date: string;
  has_file: boolean;
  file_number?: string;
  approved_by_user_id?: string;
  created_at: string;
}

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost');

export const approvalService = {
  async approveBudget(budgetId: string, fileNumber?: string) {
    if (isMockMode) return { id: 'mock-app-' + budgetId, approval_date: new Date().toISOString() };
    const { data: newApproval, error: appError } = await supabase
      .from('approvals')
      .insert([{
        budget_id: budgetId,
        file_number: fileNumber,
        has_file: !!fileNumber,
        approval_date: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (appError) throw appError;

    // Update budget status (matching C# service)
    await supabase
      .from('budgets')
      .update({ 
        status: 'Approved', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', budgetId);

    return newApproval;
  },

  async getByBudget(budgetId: string) {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('budget_id', budgetId)
      .single();
    
    if (error) throw error;
    return data;
  }
};
