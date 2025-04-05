/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `Pitch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pitch_projectId_key" ON "Pitch"("projectId");
