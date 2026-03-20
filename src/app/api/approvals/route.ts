import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const budgetId = request.nextUrl.searchParams.get('budget_id');
  try {
    let query = supabase.from('approvals').select('*').order('approval_date', { ascending: false });
    
    if (budgetId) {
      query = query.eq('budget_id', budgetId);
      const { data, error } = await query.single();
      if (error && error.code !== 'PGRST116') throw error;
      return NextResponse.json(data || null);
    } else {
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { budget_id, file_number } = body;

    const { data: result, error: insertError } = await supabase
      .from('approvals')
      .insert([{
        budget_id,
        file_number: file_number || null,
        has_file: !!file_number,
        approval_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // También actualizamos el estado del presupuesto a Approved
    const { error: updateError } = await supabase
      .from('budgets')
      .update({ status: 'Approved', updated_at: new Date().toISOString() })
      .eq('id', budget_id);

    if (updateError) throw updateError;

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
