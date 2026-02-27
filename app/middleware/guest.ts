import { getCookie } from "h3"

export default defineNuxtRouteMiddleware(() => {
  if (process.server) {
    const event = useRequestEvent()
    const token = getCookie(event!, "anilist_token")

    // Wenn eingeloggt → Dashboard
    if (token) {
      return navigateTo("/dashboard")
    }
  }
})