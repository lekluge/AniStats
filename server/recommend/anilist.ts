import { anilistRequest } from "../../services/anilist/anilistClient";
import { CACHE_TTL_ANILIST } from "./config";

const anilistCache = new Map<
  string,
  { at: number; data: { mediaId: number; status: string; score: number | null }[] }
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

  const res: any = await anilistRequest(QUERY, { userName: user });
  const out = [];

  for (const l of res?.MediaListCollection?.lists ?? []) {
    for (const e of l.entries ?? []) {
      if (!e?.media?.id) continue;
      out.push({
        mediaId: e.media.id,
        status: String(e.status),
        score: typeof e.score === "number" ? e.score : null,
      });
    }
  }

  anilistCache.set(user, { at: now, data: out });
  return out;
}
