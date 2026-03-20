import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseAnonKey) {
  console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in the browser/client environment!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
