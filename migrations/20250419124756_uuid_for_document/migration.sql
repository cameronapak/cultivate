/*
  Warnings:

  - The primary key for the `Document` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- Start a transaction
BEGIN;

-- Check if the table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Document') THEN
        RAISE EXCEPTION 'Table "Document" does not exist';
    END IF;
END $$;

-- Add new UUID column
ALTER TABLE "Document" ADD COLUMN "new_id" TEXT;

-- Generate UUIDs for existing records
UPDATE "Document" SET "new_id" = gen_random_uuid()::text;

-- Make the new column NOT NULL
ALTER TABLE "Document" ALTER COLUMN "new_id" SET NOT NULL;

-- Drop the primary key constraint
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_pkey";

-- Drop the old id column
ALTER TABLE "Document" DROP COLUMN "id";

-- Rename the new column to id
ALTER TABLE "Document" RENAME COLUMN "new_id" TO "id";

-- Add primary key constraint
ALTER TABLE "Document" ADD CONSTRAINT "Document_pkey" PRIMARY KEY ("id");

-- Drop the sequence as it's no longer needed
DROP SEQUENCE IF EXISTS "Document_id_seq";

-- Commit the transaction
COMMIT;
