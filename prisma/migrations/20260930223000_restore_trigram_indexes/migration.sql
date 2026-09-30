-- Restore the pg_trgm indexes declared by the baseline migration.
-- IF NOT EXISTS keeps this migration safe across databases where they
-- may already have been created manually.
CREATE INDEX IF NOT EXISTS "clinics_name_trgm_idx"
ON "clinics" USING GIN ("nameUnaccented" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "pets_name_trgm_idx"
ON "pets" USING GIN ("name" gin_trgm_ops);
