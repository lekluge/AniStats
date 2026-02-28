<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()

useHead(() => {
  const pageTitle = route.meta.title as string | undefined

  return {
    title: pageTitle ? `AniStats - ${pageTitle}` : "AniStats",
    link: [
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
