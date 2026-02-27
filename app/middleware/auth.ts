import { getCookie } from "h3"

export default defineNuxtRouteMiddleware(() => {
  if (process.server) {
    const event = useRequestEvent()
    const token = getCookie(event!, "anilist_token")

    if (!token) {
      return navigateTo("/")
    }
  }
})