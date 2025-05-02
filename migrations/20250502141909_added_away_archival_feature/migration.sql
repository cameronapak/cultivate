-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "isAway" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "isAway" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Thought" ADD COLUMN     "isAway" BOOLEAN NOT NULL DEFAULT false;
