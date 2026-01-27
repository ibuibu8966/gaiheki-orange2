-- Migration: Add performance indexes for frequently queried columns

-- diagnosis_requests indexes
CREATE INDEX "diagnosis_requests_status_idx" ON "diagnosis_requests"("status");
CREATE INDEX "diagnosis_requests_prefecture_idx" ON "diagnosis_requests"("prefecture");
CREATE INDEX "diagnosis_requests_created_at_idx" ON "diagnosis_requests"("created_at");
CREATE INDEX "diagnosis_requests_designated_partner_id_idx" ON "diagnosis_requests"("designated_partner_id");

-- inquiries indexes
CREATE INDEX "inquiries_inquiry_status_idx" ON "inquiries"("inquiry_status");
CREATE INDEX "inquiries_created_at_idx" ON "inquiries"("created_at");

-- partner_applications indexes
CREATE INDEX "partner_applications_application_status_idx" ON "partner_applications"("application_status");
CREATE INDEX "partner_applications_created_at_idx" ON "partner_applications"("created_at");

-- partner_details indexes
CREATE INDEX "partner_details_partners_status_idx" ON "partner_details"("partners_status");

-- partners indexes
CREATE INDEX "partners_is_active_idx" ON "partners"("is_active");

-- articles indexes
CREATE INDEX "articles_is_published_idx" ON "articles"("is_published");
CREATE INDEX "articles_category_idx" ON "articles"("category");
CREATE INDEX "articles_sort_order_idx" ON "articles"("sort_order");
