-- partner_detailsテーブルにインボイス登録番号と振込先情報のフィールドを追加

ALTER TABLE public.partner_details
ADD COLUMN IF NOT EXISTS invoice_registration_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_branch_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(255);

