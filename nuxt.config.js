export default defineNuxtConfig({
  compatibilityDate: '2026-06-24',
  srcDir: 'app',
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxtjs/i18n'
  ],
  app: {
    head: {
      script: [
        {
          defer: true,
          src: 'https://stats.matteogaillard.fr/script.js',
          'data-website-id': '9986e604-0701-44ea-9bc7-049a6ff256a1'
        }
      ]
    }
  },
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