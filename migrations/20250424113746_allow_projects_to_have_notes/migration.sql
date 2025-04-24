-- AlterTable
ALTER TABLE "Thought" ADD COLUMN     "projectId" INTEGER;

-- AddForeignKey
ALTER TABLE "Thought" ADD CONSTRAINT "Thought_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
