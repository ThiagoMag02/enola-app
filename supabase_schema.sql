-- Create Enums
CREATE TYPE entity_type AS ENUM ('Client', 'Provider', 'Both');
CREATE TYPE budget_status AS ENUM ('Draft', 'Delivered', 'Approved', 'Rejected', 'Cancelled');
CREATE TYPE purchase_order_status AS ENUM ('Pending', 'Partial', 'Billed', 'Cancelled');
CREATE TYPE invoice_status AS ENUM ('Pending', 'Paid');

-- Create Entities Table
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_id VARCHAR(20) NOT NULL,
    type entity_type NOT NULL,
    cuit VARCHAR(11) NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    fantasy_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(50),
    address VARCHAR(200),
    city VARCHAR(100),
    cbu VARCHAR(22),
    bank_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create Budgets Table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_id TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    entity_id UUID NOT NULL REFERENCES entities(id),
    provider_id UUID REFERENCES entities(id),
    rubro VARCHAR(100) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    description TEXT,
    status budget_status DEFAULT 'Draft' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create Approvals Table (Created early because PO references it)
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id),
    approval_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    has_file BOOLEAN DEFAULT false,
    file_number VARCHAR(50),
    approved_by_user_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Tenders Table
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES budgets(id),
    tender_number VARCHAR(50) NOT NULL,
    offer_amount DECIMAL(18, 2) NOT NULL,
    tender_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    file_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Purchase Orders Table
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES tenders(id),
    approval_id UUID REFERENCES approvals(id),
    po_number VARCHAR(50) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status purchase_order_status DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    invoice_number VARCHAR(50) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status invoice_status DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(18, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    method VARCHAR(50) DEFAULT 'Transfer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) - Example for Entities
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON entities FOR ALL TO authenticated USING (true);

-- Repeat for others as needed
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON budgets FOR ALL TO authenticated USING (true);

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON approvals FOR ALL TO authenticated USING (true);

ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON tenders FOR ALL TO authenticated USING (true);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON purchase_orders FOR ALL TO authenticated USING (true);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON invoices FOR ALL TO authenticated USING (true);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated users" ON payments FOR ALL TO authenticated USING (true);
