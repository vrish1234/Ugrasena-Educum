-- Create company_info table
CREATE TABLE IF NOT EXISTS company_info (
  id SERIAL PRIMARY KEY,
  contact_number TEXT,
  email_address TEXT,
  office_address TEXT,
  logo_url TEXT
);

-- Enable RLS
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users all access" ON company_info
FOR ALL TO authenticated USING (true) WITH CHECK (true);
