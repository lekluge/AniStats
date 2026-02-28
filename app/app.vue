<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

const defaultDescription = "Analyse your AniList profile with clean charts, trends, tag breakdowns and personalized recommendations."

useHead(() => {
  const pageTitle = route.meta.title as string | undefined
  const pageDescription = (route.meta.description as string | undefined) || defaultDescription
  const canonicalUrl = `${config.public.siteUrl}${route.path}`
  const isPrivateRoute = route.path !== "/" && route.path !== "/index"
  const robots = isPrivateRoute ? "noindex, nofollow" : "index, follow"

  return {
    title: pageTitle ? `AniStats - ${pageTitle}` : "AniStats",
    meta: [
      { name: "description", content: pageDescription },
      { name: "robots", content: robots },
      { property: "og:title", content: pageTitle ? `AniStats - ${pageTitle}` : "AniStats" },
      { property: "og:description", content: pageDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: `${config.public.siteUrl}/logo.png` },
      { property: "og:image:width", content: "294" },
      { property: "og:image:height", content: "204" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: pageTitle ? `AniStats - ${pageTitle}` : "AniStats" },
      { name: "twitter:description", content: pageDescription },
      { name: "twitter:image", content: `${config.public.siteUrl}/logo.png` },
    ],
    link: [
      { rel: "canonical", href: canonicalUrl },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    script: [
      {
        id: "theme-init",
        children:
          "try{const t=localStorage.getItem('anistats-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}",
      },
    ],
  }
})

const { loadUser } = useAuth()
const { initTheme } = useTheme()
const { initLocale } = useLocale()

onMounted(() => {
  initLocale()
  initTheme()
  loadUser()
})
</script>
