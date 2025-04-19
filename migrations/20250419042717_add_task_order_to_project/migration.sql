-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "taskOrder" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
