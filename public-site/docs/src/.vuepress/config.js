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
        text: 'Getting started',
        link: '/start/',
      },
      {
        text: 'Guides',
        link: '/guides/',
      },
      {
        text: 'Docs',
        link: '/docs/',
      },
      {
        text: 'Features',
        link: '/features/',
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
            'authentication/',
            'workload-identity/',
            'docker/',
            'docker-useradd/',
            'azure-key-vaults/',
            'build-secrets/',
            'environment-variables/',
            'enable-and-disable-components/',
            'external-alias/',
            'component-start-stop-restart/',
            'configure-jobs/',
            'deploy-only/',
            'build-and-deploy/',
            'deployment-promotion/',
            'monorepo/',
            'monitoring/',
            'resource-request/',
            'egress-config/',
            'git-submodules/',
            'sub-pipeline/',
            'pipeline-badge/',
            'alerting/',
            'volume-mounts/',
          ],
        },
      ],
      '/start/': [
        {
          title: 'Getting started',
          collapsable: false,
          sidebarDepth: 2,
          children: [
            '',
            'radix-concepts/',
            'getting-access/',
            'requirements/',
            'config-your-app/',
            'registering-app/',
            'workflows/',
            'radix-clusters/',
            'onboarding/',
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
            'topic-vulnerabilities/',
            'topic-monitoring/',
            'topic-domain-names/',
            'topic-cost/',
            'topic-rollingupdate/',
            'topic-uptime/',
            'topic-radix-cli/',
          ],
        },
      ],
      '/features/': [ 
        {
          title: 'List of Features',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            '',
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
            'scenarios/',
            'community/',
            'release/'
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
            'reference-code-editor-integration/',
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
