const { description } = require('../../package')

/**
 * Ref：https://v1.vuepress.vuejs.org/config/
 */
module.exports = {
  title: 'Omnia Radix',
  description: description,

  /**
   * Extra tags injected to the HTML `<head>`
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'icon', type: 'image/svg', href: '/images/logo.svg'}],
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   */
  themeConfig: {
    logo: '/images/logo.svg',
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    sidebarDepth: 1,
    nav: [
      {
        text: 'Guides',
        link: '/guides/',
      },
      {
        text: 'Docs',
        link: '/docs/',
      },
      {
        text: 'References',
        link: '/references/',
      },
      {
        text: 'Other',
        link: '/other/',
      },
      {
        text: 'Web Console',
        link: 'https://console.radix.equinor.com',
      },
    ],
    sidebar: {
      '/guides/': [
        {
          title: 'Guides',
          collapsable: false,
          children: [
            '',
            'getting-started/',
            'configure-an-app/',
            'docker/',
            'docker-useradd/',
            'workflows/',
            'environment-variables/',
            'external-alias/',
            'resource-request/',
            'deploy-only/',
            'build-secrets/',
            'deployment-promotion/',
            'pipeline-badge/',
            'configure-jobs/',
            'authentication/',
            'monitoring/',
            'alerting/',
            'component-start-stop-restart/',
            'volume-mounts/',
          ],
        },
      ],
      '/docs/': [
        {
          title: 'Docs',
          collapsable: false,
          sidebarDepth: 2,
          children: [
            '',
            'topic-concepts/',
            'topic-docker/',
            'topic-runtime-env/',
            'topic-security/',
            'topic-monitoring/',
            'topic-domain-names/',
            'topic-cost/',
            'topic-rollingupdate/',
            'topic-uptime/',
          ],
        },
      ],
      '/other/': [
        {
          title: 'Other',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            '',
            'community/',
            'onboarding/',
            'scenarios/',
            'release/',
          ],
        },
      ],
      '/references/': [
        {
          title: 'References',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            '',
            'reference-radix-config/',
            'reference-private-link/',
          ],
        },
      ],
      '/': [ // fallback README.md (main)
      ],
    },
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    'fulltext-search',
  ],
};
