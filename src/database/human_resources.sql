-- HR Module Tables

-- 1. Companies / Comitentes
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    cuit VARCHAR(11),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 2. Cost Centers
CREATE TABLE IF NOT EXISTS cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    number VARCHAR(50) NOT NULL,
    year VARCHAR(4) NOT NULL,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 3. Enums and Types
DO $$ 
BEGIN
    -- Employee Status (Vigencia)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status') THEN
        CREATE TYPE employee_status AS ENUM ('ACTIVE', 'INACTIVE');
    ELSE
        -- Update existing type if needed (PostgreSQL doesn't support DROP TYPE if used, so we handle it carefully)
        -- In a fresh dev environment, we can just alter or recreate.
        -- For this migration, we assume we can recreate or we just use it.
        ALTER TYPE employee_status RENAME VALUE 'Active' TO 'ACTIVE';
        ALTER TYPE employee_status RENAME VALUE 'Inactive' TO 'INACTIVE';
        -- Remove 'On Leave' if it exists (not trivial in PG without dropping, but we can ignore it if we don't use it)
    END IF;

    -- Employment Situation (Situación Laboral)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_situation') THEN
        CREATE TYPE employment_situation AS ENUM ('WORKING', 'ON_LEAVE', 'SUSPENDED', 'VACATION');
    END IF;
END $$;

-- 4. Employees
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) UNIQUE,
    cost_center_id UUID REFERENCES cost_centers(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    cuil VARCHAR(11) UNIQUE,
    street VARCHAR(200),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    cbu VARCHAR(22),
    bank VARCHAR(100),
    agreement VARCHAR(100),
    category VARCHAR(100),
    license_card VARCHAR(100),
    license_card_expiration DATE,
    hire_date DATE,
    seniority VARCHAR(100),
    termination_date DATE,
    termination_reason TEXT,
    status employee_status DEFAULT 'ACTIVE' NOT NULL,
    employment_status employment_situation DEFAULT 'WORKING' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Ensure CUIL uniqueness (redundant if defined in table but good practice)
CREATE UNIQUE INDEX IF NOT EXISTS employees_cuil_unique ON employees (cuil);

-- RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON companies;
CREATE POLICY "Enable all for authenticated users" ON companies FOR ALL TO authenticated USING (true);

ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON cost_centers;
CREATE POLICY "Enable all for authenticated users" ON cost_centers FOR ALL TO authenticated USING (true);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON employees;
CREATE POLICY "Enable all for authenticated users" ON employees FOR ALL TO authenticated USING (true);
