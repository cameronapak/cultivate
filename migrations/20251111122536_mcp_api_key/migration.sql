/*
  Warnings:
  - A unique constraint covering the columns `[mcpApiKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.
*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mcpApiKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_mcpApiKey_key" ON "User"("mcpApiKey");
