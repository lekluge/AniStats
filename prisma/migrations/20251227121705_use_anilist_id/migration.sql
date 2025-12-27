/*
  Warnings:

  - You are about to drop the column `anilistId` on the `Anime` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Anime" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titleEn" TEXT,
    "titleRo" TEXT,
    "cover" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Anime" ("cover", "createdAt", "id", "titleEn", "titleRo", "updatedAt") SELECT "cover", "createdAt", "id", "titleEn", "titleRo", "updatedAt" FROM "Anime";
DROP TABLE "Anime";
ALTER TABLE "new_Anime" RENAME TO "Anime";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
