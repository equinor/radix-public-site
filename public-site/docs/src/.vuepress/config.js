const { description } = require('../../package')

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'OMNIA Radix',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    sidebarDepth: 1,
    nav: [
      {
        text: 'Getting started',
        link: '/guides/getting-started/',
      },
      {
        text: 'Guides',
        link: '/guides/'
      },
      {
        text: 'Docs',
        link: '/docs/'
      },
      {
        text: 'Community',
        link: '/community/'
      },
      {
        text: 'Web Console',
        link: 'https://console.radix.equinor.com'
      }
    ],
    sidebar: {
      '/community/': [
          '/guides/',
          '/docs/'
      ],
      '/guides/': [
        {
          collapsable: false,
          prefix: "/guides/",
          children: [
            '',
            'getting-started/',
            'authentication/',
            'build-secrets/',
            'component-start-stop-restart/',
            'configure-an-app/',
            'configure-jobs/',
            'deploy-only/',
            'deployment-promotion/',
            'docker/',
            'docker-useradd/',
            'environment-variables/',
            'external-alias/',
            'monitoring/',
            'onboarding/',
            'pipeline-badge/',
            'resource-request/',
            'scenarios/',
            'volume-mounts/',
            'workflows/',
          ]
        },
      ],
      '/docs/': [
        {
          collapsable: true,
          prefix: "/docs/",
          sidebarDepth: 2,
          children: [
            '',
            'reference-private-link/',
            'reference-radix-api/',
            'reference-radix-config/',
            'release/',
            'topic-concepts/',
            'topic-cost/',
            'topic-docker/',
            'topic-domain-names/',
            'topic-monitoring/',
            'topic-rollingupdate/',
            'topic-runtime-env/',
            'topic-security/',
            'topic-uptime/',
          ]
        }
      ],
      '/': [ // fallback README.md (main)
      ]
    }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    'fulltext-search',
  ]
}
