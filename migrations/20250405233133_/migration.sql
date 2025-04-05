/*
  Warnings:

  - You are about to drop the column `isSelected` on the `Pitch` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Resource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "Resource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pitch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "appetite" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "rabbitHoles" TEXT,
    "noGos" TEXT,
    "audience" TEXT,
    "insights" TEXT,
    "successMetrics" TEXT,
    "projectId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pitch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pitch" ("appetite", "audience", "createdAt", "id", "insights", "noGos", "problem", "projectId", "rabbitHoles", "solution", "successMetrics", "title", "updatedAt") SELECT "appetite", "audience", "createdAt", "id", "insights", "noGos", "problem", "projectId", "rabbitHoles", "solution", "successMetrics", "title", "updatedAt" FROM "Pitch";
DROP TABLE "Pitch";
ALTER TABLE "new_Pitch" RENAME TO "Pitch";
CREATE UNIQUE INDEX "Pitch_projectId_key" ON "Pitch"("projectId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
