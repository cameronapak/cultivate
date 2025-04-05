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
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pitch_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pitch" ("appetite", "audience", "createdAt", "id", "insights", "isSelected", "noGos", "problem", "projectId", "rabbitHoles", "solution", "successMetrics", "title", "updatedAt") SELECT "appetite", "audience", "createdAt", "id", "insights", "isSelected", "noGos", "problem", "projectId", "rabbitHoles", "solution", "successMetrics", "title", "updatedAt" FROM "Pitch";
DROP TABLE "Pitch";
ALTER TABLE "new_Pitch" RENAME TO "Pitch";
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("complete", "createdAt", "description", "id", "projectId", "status", "title", "updatedAt") SELECT "complete", "createdAt", "description", "id", "projectId", "status", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
