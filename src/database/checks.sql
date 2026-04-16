-- Create the "checks" table
CREATE TABLE IF NOT EXISTS public.checks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_date date NOT NULL,
  due_date date NOT NULL,
  check_number text NOT NULL,
  provider_id uuid REFERENCES public.entities(id),
  amount decimal(15, 2) NOT NULL,
  status text NOT NULL CHECK (status IN ('Pendiente', 'Pagado')),
  observations text,
  details text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- set up row level security
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;

-- create RLS policies
CREATE POLICY "Enable read access for all authenticated users on checks" ON public.checks
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for all authenticated users on checks" ON public.checks
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for all authenticated users on checks" ON public.checks
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for all authenticated users on checks" ON public.checks
FOR DELETE TO authenticated USING (true);

-- if needed create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.checks
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
