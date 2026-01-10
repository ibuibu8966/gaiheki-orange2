-- テスト用の顧客請求書データを作成

-- まず、既存のデータを確認
-- partner_id = 1 のcustomersを確認
SELECT c.id, c.customer_name, c.partner_id 
FROM customers c 
WHERE c.partner_id = 1 
LIMIT 5;

-- ordersテーブルを確認
SELECT o.id, o.quotation_id, o.order_status
FROM orders o
JOIN quotations q ON o.quotation_id = q.id
JOIN diagnosis_requests dr ON q.diagnosis_request_id = dr.id
JOIN customers c ON dr.customer_id = c.id
WHERE c.partner_id = 1
LIMIT 5;

-- customer_invoicesを確認
SELECT ci.id, ci.invoice_number, ci.order_id
FROM customer_invoices ci
JOIN orders o ON ci.order_id = o.id
JOIN quotations q ON o.quotation_id = q.id
JOIN diagnosis_requests dr ON q.diagnosis_request_id = dr.id
JOIN customers c ON dr.customer_id = c.id
WHERE c.partner_id = 1;

