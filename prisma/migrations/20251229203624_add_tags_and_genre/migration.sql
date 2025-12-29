-- CreateTable
CREATE TABLE "Genre" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rank" INTEGER,
    "isAdult" BOOLEAN NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
