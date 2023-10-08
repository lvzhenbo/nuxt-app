// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    // "@huntersofbook/naive-ui-nuxt",
    "@nuxtjs/tailwindcss",
    "@bg-dev/nuxt-naiveui",
  ],
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
});
