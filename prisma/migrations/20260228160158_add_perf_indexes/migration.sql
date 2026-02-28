-- CreateIndex
CREATE INDEX "Anime_format_idx" ON "Anime"("format");

-- CreateIndex
CREATE INDEX "Anime_startYear_idx" ON "Anime"("startYear");

-- CreateIndex
CREATE INDEX "Anime_season_idx" ON "Anime"("season");

-- CreateIndex
CREATE INDEX "Anime_averageScore_idx" ON "Anime"("averageScore");

-- CreateIndex
CREATE INDEX "Anime_season_startYear_idx" ON "Anime"("season", "startYear");

-- CreateIndex
CREATE INDEX "AnimeRelation_toId_idx" ON "AnimeRelation"("toId");

-- CreateIndex
CREATE INDEX "AnimeRelation_relationType_idx" ON "AnimeRelation"("relationType");

-- CreateIndex
CREATE INDEX "AnimeRelation_relationType_fromId_toId_idx" ON "AnimeRelation"("relationType", "fromId", "toId");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");
