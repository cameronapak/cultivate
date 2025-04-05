/*
  Warnings:

  - You are about to drop the column `appetite` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `audience` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `insights` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `noGos` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `problem` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `rabbitHoles` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `solution` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `successMetrics` on the `Project` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Pitch" (
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
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pitch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("createdAt", "description", "id", "title", "updatedAt") SELECT "createdAt", "description", "id", "title", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
