export default defineEventHandler(async (event) => {
  deleteCookie(event, "anilist_token", {
    path: "/",
  });
  return sendRedirect(event, "/");
});
