-- 過去6ヶ月分のテストデータを作成
-- 加盟店3店舗、月平均：見積8-12件、受注4-8件、完了2-5件

-- まず、既存のテストデータをクリーンアップ（必要に応じて）
-- DELETE FROM customer_invoices;
-- DELETE FROM order_photos;
-- DELETE FROM orders;
-- DELETE FROM quotations;
-- DELETE FROM diagnosis_requests;
-- DELETE FROM customers;
-- DELETE FROM company_invoices;
-- DELETE FROM partner_prefectures;
-- DELETE FROM partner_details;
-- DELETE FROM partners WHERE login_email LIKE '%historical%';

-- 追加の加盟店を作成（既存の test@partner.com に加えて2店舗）
INSERT INTO partners (username, login_email, password_hash, is_active, fee_plan_id, created_at, updated_at)
VALUES
  ('historical_partner_1', 'historical1@partner.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5isl/IVTx6WPO', true, 1, '2024-11-01', NOW()),
  ('historical_partner_2', 'historical2@partner.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5isl/IVTx6WPO', true, 1, '2025-03-15', NOW())
ON CONFLICT (login_email) DO NOTHING;

-- 加盟店詳細を追加
INSERT INTO partner_details (partner_id, company_name, phone_number, address, representative_name, business_description, appeal_text, partners_status, created_at, updated_at)
SELECT
  p.id,
  CASE
    WHEN p.login_email = 'historical1@partner.com' THEN '大阪塗装工業株式会社'
    WHEN p.login_email = 'historical2@partner.com' THEN '東京外壁プロ'
    ELSE '不明'
  END,
  CASE
    WHEN p.login_email = 'historical1@partner.com' THEN '06-1234-5678'
    WHEN p.login_email = 'historical2@partner.com' THEN '03-9876-5432'
    ELSE '000-0000-0000'
  END,
  CASE
    WHEN p.login_email = 'historical1@partner.com' THEN '大阪府大阪市北区梅田1-1-1'
    WHEN p.login_email = 'historical2@partner.com' THEN '東京都千代田区丸の内1-1-1'
    ELSE '不明'
  END,
  CASE
    WHEN p.login_email = 'historical1@partner.com' THEN '田中 一郎'
    WHEN p.login_email = 'historical2@partner.com' THEN '鈴木 次郎'
    ELSE '不明'
  END,
  '高品質な外壁塗装サービスを提供しています',
  '丁寧な仕事が自慢です',
  'ACTIVE',
  NOW(),
  NOW()
FROM partners p
WHERE p.login_email IN ('historical1@partner.com', 'historical2@partner.com')
ON CONFLICT (partner_id) DO NOTHING;

-- 過去6ヶ月分のデータを作成するための一時テーブル
CREATE TEMP TABLE temp_historical_data AS
WITH months AS (
  SELECT
    generate_series(
      date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
      date_trunc('month', CURRENT_DATE),
      '1 month'::interval
    )::date AS month_start
),
partners_list AS (
  SELECT id, login_email
  FROM partners
  WHERE login_email IN ('test@partner.com', 'historical1@partner.com', 'historical2@partner.com')
),
monthly_data AS (
  SELECT
    m.month_start,
    p.id AS partner_id,
    p.login_email,
    -- 月ごとに見積数を変動させる（8-12件）
    (8 + floor(random() * 5))::int AS quotations_count,
    -- 受注率50-70%
    (0.5 + random() * 0.2) AS order_rate,
    -- 完了率60-80%（受注に対して）
    (0.6 + random() * 0.2) AS completion_rate
  FROM months m
  CROSS JOIN partners_list p
)
SELECT * FROM monthly_data;

-- 顧客、診断依頼、見積、受注、完了を一括作成
DO $$
DECLARE
  rec RECORD;
  customer_id INT;
  diagnosis_id INT;
  quotation_id INT;
  order_id INT;
  i INT;
  quotation_date TIMESTAMP;
  order_date TIMESTAMP;
  completion_date TIMESTAMP;
  quotation_amount INT;
  customer_count INT := 1;
BEGIN
  FOR rec IN SELECT * FROM temp_historical_data LOOP
    FOR i IN 1..rec.quotations_count LOOP
      -- 見積作成日：その月の1-28日のランダムな日
      quotation_date := rec.month_start + (floor(random() * 27) || ' days')::interval + (floor(random() * 24) || ' hours')::interval;

      -- 見積金額：150万〜500万円
      quotation_amount := (1500000 + floor(random() * 3500000))::int;

      -- 顧客作成
      INSERT INTO customers (
        partner_id, customer_name, customer_phone, customer_email,
        construction_address, customer_construction_type, construction_amount,
        customer_status, created_at, updated_at
      ) VALUES (
        rec.partner_id,
        '顧客' || customer_count || '様',
        '090-' || lpad(floor(random() * 10000)::text, 4, '0') || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
        'customer' || customer_count || '@example.com',
        CASE floor(random() * 3)::int
          WHEN 0 THEN '東京都新宿区西新宿' || floor(random() * 9 + 1) || '-' || floor(random() * 9 + 1) || '-' || floor(random() * 9 + 1)
          WHEN 1 THEN '大阪府大阪市中央区難波' || floor(random() * 9 + 1) || '-' || floor(random() * 9 + 1) || '-' || floor(random() * 9 + 1)
          ELSE '神奈川県横浜市中区桜木町' || floor(random() * 9 + 1) || '-' || floor(random() * 9 + 1) || '-' || floor(random() * 9 + 1)
        END,
        CASE floor(random() * 3)::int
          WHEN 0 THEN 'EXTERIOR_PAINTING'
          WHEN 1 THEN 'ROOF_PAINTING'
          ELSE 'EXTERIOR_AND_ROOF'
        END,
        quotation_amount,
        CASE
          WHEN random() < rec.order_rate AND random() < rec.completion_rate THEN 'COMPLETED'
          WHEN random() < rec.order_rate THEN 'ORDERED'
          ELSE 'QUOTED'
        END,
        quotation_date,
        quotation_date
      ) RETURNING id INTO customer_id;

      customer_count := customer_count + 1;

      -- 診断依頼作成
      INSERT INTO diagnosis_requests (
        diagnosis_number, customer_id, designated_partner_id,
        prefecture, floor_area, current_situation, construction_type,
        status, created_at, updated_at
      ) VALUES (
        'DIAG-' || TO_CHAR(quotation_date, 'YYYYMMDD') || '-' || lpad(i::text, 4, '0'),
        customer_id,
        rec.partner_id,
        CASE floor(random() * 3)::int
          WHEN 0 THEN 'Tokyo'
          WHEN 1 THEN 'Osaka'
          ELSE 'Kanagawa'
        END,
        CASE floor(random() * 5)::int
          WHEN 0 THEN 'UNDER_100'
          WHEN 1 THEN 'FROM_101_TO_120'
          WHEN 2 THEN 'FROM_121_TO_200'
          WHEN 3 THEN 'FROM_201_TO_300'
          ELSE 'FROM_301_TO_500'
        END,
        'READY_TO_ORDER',
        CASE floor(random() * 3)::int
          WHEN 0 THEN 'EXTERIOR_PAINTING'
          WHEN 1 THEN 'ROOF_PAINTING'
          ELSE 'EXTERIOR_AND_ROOF'
        END,
        'DECIDED',
        quotation_date - INTERVAL '1 day',
        quotation_date - INTERVAL '1 day'
      ) RETURNING id INTO diagnosis_id;

      -- 見積作成
      INSERT INTO quotations (
        diagnosis_request_id, partner_id, quotation_amount,
        appeal_text, is_selected, created_at, updated_at
      ) VALUES (
        diagnosis_id,
        rec.partner_id,
        quotation_amount,
        '丁寧な施工でお客様にご満足いただけるよう努めます',
        true,
        quotation_date,
        quotation_date
      ) RETURNING id INTO quotation_id;

      -- 受注するかどうか（確率的に決定）
      IF random() < rec.order_rate THEN
        -- 受注日：見積から1-14日後
        order_date := quotation_date + (floor(random() * 14) || ' days')::interval;

        -- 次の月になった場合は調整
        IF date_trunc('month', order_date) > rec.month_start THEN
          order_date := rec.month_start + INTERVAL '1 month' + (floor(random() * 14) || ' days')::interval;
        END IF;

        -- 受注作成
        INSERT INTO orders (
          quotation_id, order_status, order_date,
          construction_start_date, construction_end_date,
          construction_amount, created_at, updated_at
        ) VALUES (
          quotation_id,
          CASE
            WHEN random() < rec.completion_rate THEN 'COMPLETED'
            ELSE 'IN_PROGRESS'
          END,
          order_date,
          order_date + INTERVAL '3 days',
          order_date + INTERVAL '14 days',
          quotation_amount,
          order_date,
          order_date
        ) RETURNING id INTO order_id;

        -- 完了するかどうか
        IF random() < rec.completion_rate THEN
          -- 完了日：受注から7-21日後
          completion_date := order_date + (7 + floor(random() * 15))::int * INTERVAL '1 day';

          -- さらに次の月になった場合は調整
          IF date_trunc('month', completion_date) > date_trunc('month', order_date) THEN
            completion_date := date_trunc('month', order_date) + INTERVAL '1 month' + (floor(random() * 21) || ' days')::interval;
          END IF;

          -- 注文を完了状態に更新
          UPDATE orders
          SET
            order_status = 'COMPLETED',
            completion_date = completion_date,
            updated_at = completion_date
          WHERE id = order_id;

          -- 顧客請求書作成
          INSERT INTO customer_invoices (
            order_id, invoice_number, subtotal, tax, grand_total,
            status, payment_method, created_at, updated_at
          ) VALUES (
            order_id,
            'INV-' || TO_CHAR(completion_date, 'YYYYMMDD') || '-' || lpad(order_id::text, 6, '0'),
            quotation_amount,
            (quotation_amount * 0.1)::int,
            (quotation_amount * 1.1)::int,
            CASE floor(random() * 3)::int
              WHEN 0 THEN 'PAID'
              WHEN 1 THEN 'UNPAID'
              ELSE 'PAID'
            END,
            CASE floor(random() * 2)::int
              WHEN 0 THEN 'BANK_TRANSFER'
              ELSE 'CREDIT_CARD'
            END,
            completion_date,
            completion_date
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- 一時テーブル削除
DROP TABLE temp_historical_data;

-- 結果確認用クエリ
SELECT
  TO_CHAR(q.created_at, 'YYYY/MM') AS month,
  COUNT(DISTINCT q.id) AS quotations,
  COUNT(DISTINCT o.id) FILTER (WHERE o.order_date IS NOT NULL) AS orders,
  COUNT(DISTINCT o.id) FILTER (WHERE o.order_status IN ('COMPLETED', 'REVIEW_COMPLETED')) AS completed,
  COALESCE(SUM(ci.grand_total), 0) AS total_revenue
FROM quotations q
LEFT JOIN orders o ON q.id = o.quotation_id
LEFT JOIN customer_invoices ci ON o.id = ci.order_id
WHERE q.created_at >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY TO_CHAR(q.created_at, 'YYYY/MM')
ORDER BY month;
