export function useAnilistUser() {
  const cookie = useCookie<string>("anilist-user", { default: () => "" });

  return computed({
    get: () => cookie.value ?? "",
    set: (v: string) => (cookie.value = v.trim()),
  });
}
