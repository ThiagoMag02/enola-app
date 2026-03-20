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

export const approvalService = {
  async approveBudget(budgetId: string, fileNumber?: string): Promise<Approval> {
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

    // Actualiza el presupuesto asociado a Approved
    await supabase
      .from('budgets')
      .update({ status: 'Approved', updated_at: new Date().toISOString() })
      .eq('id', budgetId);

    return newApproval as Approval;
  },

  async getByBudget(budgetId: string): Promise<Approval> {
    const { data, error } = await supabase
      .from('approvals')
      .select('*')
      .eq('budget_id', budgetId)
      .single();
    if (error) throw error;
    return data as Approval;
  }
};
