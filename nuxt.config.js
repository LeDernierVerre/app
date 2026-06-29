export default defineNuxtConfig({
  compatibilityDate: '2026-06-24',
  srcDir: 'app',
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxtjs/i18n'
  ],
  i18n: {
    defaultLocale: 'fr',
    strategy: 'no_prefix',

    locales: [
      {
        code: 'fr',
        name: 'Français',
        language: 'fr-FR',
        file: 'fr.json'
      },
    ],

    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'fr'
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'socket.io-client',
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      socketUrl: '',
      apiBase: ''
    }
  }
})