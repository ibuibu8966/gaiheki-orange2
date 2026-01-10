-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  postal_code VARCHAR(10),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  invoice_registration_number VARCHAR(20),
  bank_name VARCHAR(100),
  bank_branch_name VARCHAR(100),
  bank_account_type VARCHAR(20),
  bank_account_number VARCHAR(20),
  bank_account_holder VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
