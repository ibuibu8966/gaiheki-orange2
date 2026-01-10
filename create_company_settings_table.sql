-- company_settingsテーブルを作成
CREATE TABLE IF NOT EXISTS public.company_settings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    invoice_registration_number VARCHAR(50),
    bank_name VARCHAR(255),
    bank_branch_name VARCHAR(255),
    bank_account_type VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_account_holder VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE
    ON public.company_settings FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

