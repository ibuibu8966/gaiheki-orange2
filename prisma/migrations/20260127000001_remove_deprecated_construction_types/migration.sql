-- Migration: Remove deprecated ConstructionType enum values
-- This migration converts existing data using deprecated enum values to current values

-- Step 1: Update existing records with deprecated values
UPDATE diagnosis_requests
SET construction_type = 'EXTERIOR_PAINTING'
WHERE construction_type = 'EXTERIOR_AND_ROOF';

UPDATE diagnosis_requests
SET construction_type = 'EXTERIOR_WORK'
WHERE construction_type = 'SIDING_REPLACEMENT';

UPDATE diagnosis_requests
SET construction_type = 'OTHER'
WHERE construction_type = 'PARTIAL_REPAIR';

UPDATE diagnosis_requests
SET construction_type = 'LARGE_SCALE_WORK'
WHERE construction_type = 'FULL_REPLACEMENT';

-- Step 2: Remove deprecated values from the enum
-- Note: PostgreSQL requires recreating the enum type to remove values

-- Create new enum type without deprecated values
CREATE TYPE "ConstructionType_new" AS ENUM (
  'EXTERIOR_PAINTING',
  'ROOF_PAINTING',
  'SCAFFOLDING_WORK',
  'WATERPROOFING',
  'LARGE_SCALE_WORK',
  'INTERIOR_WORK',
  'EXTERIOR_WORK',
  'OTHER'
);

-- Alter column to use new enum type
ALTER TABLE diagnosis_requests
  ALTER COLUMN construction_type TYPE "ConstructionType_new"
  USING construction_type::text::"ConstructionType_new";

-- Drop old enum type and rename new one
DROP TYPE "ConstructionType";
ALTER TYPE "ConstructionType_new" RENAME TO "ConstructionType";
