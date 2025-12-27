-- CreateTable
CREATE TABLE "AnimeGenre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "animeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "AnimeGenre_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnimeTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "animeId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "rank" INTEGER,
    "isAdult" BOOLEAN NOT NULL,
    CONSTRAINT "AnimeTag_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AnimeGenre_animeId_name_key" ON "AnimeGenre"("animeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeTag_animeId_tagId_key" ON "AnimeTag"("animeId", "tagId");
