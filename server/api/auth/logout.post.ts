import { clearAniListAuthCookies } from "../../utils/anilistAuth"

export default defineEventHandler(async (event) => {
  clearAniListAuthCookies(event)
  return sendRedirect(event, "/");
});
