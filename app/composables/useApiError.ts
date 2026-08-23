import { isAxiosError } from "axios";

function isAniListUnavailable(e: unknown): boolean {
  if (!isAxiosError(e)) return false;
  if (e.response?.status !== 403) return false;
  const data = e.response?.data as { data?: { anilistUnavailable?: boolean } } | undefined;
  return Boolean(data?.data?.anilistUnavailable);
}

export function resolveApiErrorMessage(
  e: unknown,
  t: (key: string) => string,
  loadErrorKey: string,
): string {
  if (isAniListUnavailable(e)) {
    return t("common.aniListUnavailable");
  }
  return `${t("common.errorPrefix")}: ${t(loadErrorKey)}`;
}
