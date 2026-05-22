// https://nuxt.com/docs/api/configuration/nuxt-config
// `defineNuxtConfig` is auto-imported by Nuxt — declared here so the root config type-checks standalone.
declare function defineNuxtConfig(config: unknown): unknown;

export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
  typescript: { strict: true },
  runtimeConfig: {
    public: {
      serverUrl: process.env.NUXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",
    },
  },
  devServer: { port: 3001 },
});
