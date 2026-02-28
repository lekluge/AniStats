import { anilistRequest } from "../../services/anilist/anilistClient";
import { CACHE_TTL_ANILIST } from "./config";
import type { AniListCollection } from "../types/api/anilist";
import type { AnilistMediaListEntry } from "./types/entities";

const anilistCache = new Map<
  string,
  { at: number; data: AnilistMediaListEntry[] }
>();

const QUERY = `
query ($userName: String!) {
  MediaListCollection(userName: $userName, type: ANIME) {
    lists {
      entries {
        status
        score(format: POINT_10)
        media { id }
      }
    }
  }
}
`;

export async function loadUserAnilistEntries(user: string) {
  const hit = anilistCache.get(user);
  const now = Date.now();
  if (hit && now - hit.at < CACHE_TTL_ANILIST) return hit.data;

  const res = await anilistRequest<AniListCollection<{
    status?: string | null;
    score?: number | null;
    media?: { id?: number | null } | null;
  }>>(QUERY, { userName: user });
  const out: AnilistMediaListEntry[] = [];

  for (const list of res.MediaListCollection?.lists ?? []) {
    if (!list) continue;
    for (const entry of list.entries ?? []) {
      const id = entry?.media?.id;
      if (!id) continue;
      out.push({
        mediaId: id,
        status: typeof entry?.status === "string" ? entry.status : "",
        score: typeof entry?.score === "number" ? entry.score : null,
      });
    }
  }

  anilistCache.set(user, { at: now, data: out });
  return out;
}
