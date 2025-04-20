/*
  Warnings:

  - The primary key for the `Canvas` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Canvas" DROP CONSTRAINT "Canvas_pkey",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled Canvas',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Canvas_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Canvas_id_seq";
