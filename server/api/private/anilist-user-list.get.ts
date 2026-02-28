import { createError, defineEventHandler, getQuery } from "h3";
import type {
  AniGraphQLResponse,
  AniListCollection,
  AniUserStatusEntry,
} from "../../types/api/anilist";

const USER_LIST_QUERY = `
  query ($user: String!) {
    MediaListCollection(userName: $user, type: ANIME) {
      lists {
        entries {
          mediaId
          status
        }
      }
    }
  }
`;

interface NormalizedStatusEntry {
  mediaId: number;
  status: string;
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function isNormalizedStatusEntry(
  value: AniUserStatusEntry | null | undefined
): value is NormalizedStatusEntry {
  return (
    isPresent(value) &&
    typeof value.mediaId === "number" &&
    typeof value.status === "string" &&
    value.status.length > 0
  );
}

function normalizeStatusLists(
  response: AniGraphQLResponse<AniListCollection<AniUserStatusEntry>>
) {
  const lists = response.data?.MediaListCollection?.lists ?? [];
  return lists.filter(isPresent).map((list) => ({
    entries: (list.entries ?? []).filter(isNormalizedStatusEntry),
  }));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function aniFetch(
  query: string,
  variables: Record<string, unknown>,
  attempt = 1
): Promise<AniGraphQLResponse<AniListCollection<AniUserStatusEntry>>> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 429) {
    if (attempt >= 5) {
      throw createError({ statusCode: 429, statusMessage: "AniList rate limit exceeded" });
    }

    const retryAfter = res.headers.get("retry-after");
    const waitMs = retryAfter ? Number(retryAfter) * 1000 : 1000 * 2 ** attempt;
    await sleep(waitMs);
    return aniFetch(query, variables, attempt + 1);
  }

  if (!res.ok) {
    throw createError({ statusCode: res.status, statusMessage: await res.text() });
  }

  return res.json();
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const user = String(q.user ?? "").trim();

  if (!user) {
    throw createError({ statusCode: 400, statusMessage: "Missing query param: user" });
  }

  await sleep(300);

  const res = await aniFetch(USER_LIST_QUERY, { user });
  const lists = normalizeStatusLists(res);

  const statusMap: Record<number, string> = {};
  for (const list of lists) {
    for (const entry of list.entries) {
      statusMap[entry.mediaId] = entry.status;
    }
  }

  return {
    ok: true,
    user,
    count: Object.keys(statusMap).length,
    statusMap,
  };
});
