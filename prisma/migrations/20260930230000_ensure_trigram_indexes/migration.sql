-- Ensure the pg_trgm indexes exist after the historical drift repair.
CREATE INDEX IF NOT EXISTS "clinics_name_trgm_idx"
ON "clinics" USING GIN ("nameUnaccented" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "pets_name_trgm_idx"
ON "pets" USING GIN ("name" gin_trgm_ops);
