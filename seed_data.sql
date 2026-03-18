-- Seed Entities
INSERT INTO entities (custom_id, type, cuit, business_name, fantasy_name, email, phone) VALUES
('2026030001', 'Client', '30711111118', 'Tech Dynamics S.A.', 'Tech Dynamics', 'info@techdynamics.com', '+54 11 4444-5555'),
('2026030002', 'Provider', '30722222228', 'Global Solutions SRL', 'Global Sol', 'sales@globalsol.com', '+54 11 6666-7777');

-- Seed Budgets
INSERT INTO budgets (custom_id, entity_id, rubro, amount, status, description) VALUES
('B-001', (SELECT id FROM entities WHERE custom_id = '2026030001'), 'Software Development', 15000.00, 'Approved', 'Initial development of the Radiant platform'),
('B-002', (SELECT id FROM entities WHERE custom_id = '2026030001'), 'Hardware Purchase', 5000.00, 'Draft', 'Servers for staging environment');
