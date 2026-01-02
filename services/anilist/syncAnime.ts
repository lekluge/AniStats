import { prisma } from "../../utils/prisma";
import { anilistRequest } from "./anilistClient";
import crypto from "crypto";

const QUERY = `
query FullAnime($id: Int!) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
    }
    format
    averageScore
    season
    seasonYear
    episodes
    updatedAt

    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }

    coverImage {
      large
    }
    genres
    tags {
      id
      name
      rank
      isAdult
    }
    relations {
      edges {
        relationType
        node {
          id
        }
      }
    }
  }
}
`;

type FuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
};

type FullAnimeResponse = {
  Media: {
    id: number;
    title: {
      romaji: string | null;
      english: string | null;
    };
    format: string | null;
    averageScore: number | null;
    season: string | null;
    seasonYear: number | null;
    episodes: number | null;
    updatedAt: number;

    startDate: FuzzyDate | null;
    endDate: FuzzyDate | null;

    coverImage: { large: string | null };
    genres: string[];
    tags: {
      id: number;
      name: string;
      rank: number | null;
      isAdult: boolean;
    }[];
    relations: {
      edges: {
        relationType: string;
        node: { id: number };
      }[];
    };
  };
};

function hashAnime(m: FullAnimeResponse["Media"]) {
  return crypto
    .createHash("sha1")
    .update(
      JSON.stringify({
        en: m.title.english,
        ro: m.title.romaji,
        cover: m.coverImage.large,
        format: m.format,
        averageScore: m.averageScore,
        season: m.season,
        seasonYear: m.seasonYear,
        episodes: m.episodes,

        startDate: m.startDate,
        endDate: m.endDate,

        genres: m.genres,
        tags: m.tags.map((t) => t.id),
      })
    )
    .digest("hex");
}

export async function syncAnime(anilistId: number) {
  const { Media } = await anilistRequest<FullAnimeResponse>(QUERY, {
    id: anilistId,
  });

  const dataHash = hashAnime(Media);

  const existing = await prisma.anime.findUnique({
    where: { id: Media.id },
    select: { dataHash: true },
  });

  // ✅ Skip wenn unverändert
  if (existing?.dataHash === dataHash) {
    console.log(`[AniList Sync] skip unchanged anime id=${Media.id}`);
    return;
  }

  // -----------------------------
  // Anime
  // -----------------------------
  await prisma.anime.upsert({
    where: { id: Media.id },
    update: {
      titleEn: Media.title.english,
      titleRo: Media.title.romaji,
      cover: Media.coverImage.large,
      format: Media.format,
      averageScore: Media.averageScore,
      season: Media.season,
      seasonYear: Media.seasonYear,
      episodes: Media.episodes,

      startYear: Media.startDate?.year ?? null,
      startMonth: Media.startDate?.month ?? null,
      startDay: Media.startDate?.day ?? null,

      endYear: Media.endDate?.year ?? null,
      endMonth: Media.endDate?.month ?? null,
      endDay: Media.endDate?.day ?? null,

      dataHash,
    },
    create: {
      id: Media.id,
      titleEn: Media.title.english,
      titleRo: Media.title.romaji,
      cover: Media.coverImage.large,
      format: Media.format,
      averageScore: Media.averageScore,
      season: Media.season,
      seasonYear: Media.seasonYear,
      episodes: Media.episodes,

      startYear: Media.startDate?.year ?? null,
      startMonth: Media.startDate?.month ?? null,
      startDay: Media.startDate?.day ?? null,

      endYear: Media.endDate?.year ?? null,
      endMonth: Media.endDate?.month ?? null,
      endDay: Media.endDate?.day ?? null,

      dataHash,
    },
  });

  // -----------------------------
  // Genres
  // -----------------------------
  await prisma.animeGenre.deleteMany({
    where: { animeId: Media.id },
  });

  if (Media.genres.length > 0) {
    await prisma.animeGenre.createMany({
      data: Media.genres.map((name) => ({
        animeId: Media.id,
        name,
      })),
    });
  }

  // -----------------------------
  // Tags
  // -----------------------------
  await prisma.animeTag.deleteMany({
    where: { animeId: Media.id },
  });

  if (Media.tags.length > 0) {
    await prisma.animeTag.createMany({
      data: Media.tags.map((t) => ({
        animeId: Media.id,
        tagId: t.id,
        name: t.name,
        rank: t.rank,
        isAdult: t.isAdult,
      })),
    });
  }

  // -----------------------------
  // Relations
  // -----------------------------

  // Alte Relations löschen
  await prisma.animeRelation.deleteMany({
    where: { fromId: Media.id },
  });

  // Ziel-IDs sammeln
  const targetIds = Media.relations.edges.map((e) => e.node.id);

  if (targetIds.length > 0) {
    // 🔹 prüfen, welche Anime bereits existieren
    const existing = await prisma.anime.findMany({
      where: { id: { in: targetIds } },
      select: { id: true },
    });

    const existingIds = new Set(existing.map((a) => a.id));

    // 🔹 nur fehlende IDs als Stub anlegen
    const missingIds = targetIds.filter((id) => !existingIds.has(id));

    if (missingIds.length > 0) {
      await prisma.anime.createMany({
        data: missingIds.map((id) => ({ id })),
      });
    }
  }

  // Relations schreiben
  if (Media.relations.edges.length > 0) {
    await prisma.animeRelation.createMany({
      data: Media.relations.edges.map((e) => ({
        fromId: Media.id,
        toId: e.node.id,
        relationType: e.relationType,
      })),
    });
  }

  // Mini Rate-Limit Guard
  await new Promise((r) => setTimeout(r, 300));
}
