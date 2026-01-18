-- Migration Template for Prisma
-- Generated: {TIMESTAMP}
-- Description: {DESCRIPTION}

-- CreateTable
CREATE TABLE "{TABLE_NAME}" (
    "id" SERIAL PRIMARY KEY,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- CreateIndex (for timestamp-based queries)
CREATE INDEX "{TABLE_NAME}_created_at_idx" ON "{TABLE_NAME}"("created_at");

-- AddForeignKey (example)
-- ALTER TABLE "{TABLE_NAME}"
-- ADD CONSTRAINT "{TABLE_NAME}_{COLUMN}_fkey"
-- FOREIGN KEY ("{COLUMN}")
-- REFERENCES "{REFERENCED_TABLE}"("{REFERENCED_COLUMN}")
-- ON DELETE CASCADE;

-- Rollback
-- DROP TABLE "{TABLE_NAME}";
