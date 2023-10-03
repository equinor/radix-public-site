import { defineUserConfig, defaultTheme } from 'vuepress';
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import { getDirname, path } from '@vuepress/utils'
import { fullTextSearchPlugin } from 'vuepress-plugin-full-text-search2';

const __dirname = getDirname(import.meta.url)

export default defineUserConfig({
  lang: 'en-US',
  title: 'Omnia Radix',
  description: 'Omnia Radix',
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'icon', type: 'image/svg', href: '/images/logo.svg' }],
  ],
  theme: defaultTheme({
    logo: '/images/logo.svg',
    contributors: false,
    repo: '',
    editLink: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    sidebarDepth: 1,
    navbar: [
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
          text: 'Guides',
          collapsible: false,
          children: [
            '/guides/',
            '/guides/authentication/',
            '/guides/workload-identity/',
            '/guides/docker/',
            '/guides/docker-useradd/',
            '/guides/azure-key-vaults/',
            '/guides/build-secrets/',
            '/guides/environment-variables/',
            '/guides/enable-and-disable-components/',
            '/guides/external-alias/',
            '/guides/component-start-stop-restart/',
            {
              link: '/guides/jobs/', 
              text: "Jobs",
              collapsible: true,
              children: [
                '/guides/jobs/configure-jobs',
                '/guides/jobs/job-manager-and-job-api',
                '/guides/jobs/environment-variables',
                '/guides/jobs/jobs-in-web-console',
                '/guides/jobs/openapi-swagger'
              ]
            },
            '/guides/deploy-only/',
            '/guides/build-and-deploy/',
            '/guides/deployment-promotion/',
            '/guides/monorepo/',
            '/guides/monitoring/',
            '/guides/resource-request/',
            '/guides/egress-config/',
            '/guides/git-submodules/',
            '/guides/sub-pipeline/',
            '/guides/pipeline-badge/',
            '/guides/alerting/',
            '/guides/volume-mounts/',
          ],
        },
      ],
      '/start/': [
        {
          text: 'Getting started',
          collapsible: false,
          children: [
            '/start/',
            '/start/radix-concepts/',
            '/start/getting-access/',
            '/start/requirements/',
            '/start/config-your-app/',
            '/start/registering-app/',
            '/start/workflows/',
            '/start/radix-clusters/',
            '/start/onboarding/',
          ],
        },
      ],
      '/docs/': [
        {
          text: 'Docs',
          collapsible: false,
          children: [
            '/docs/',
            '/docs/topic-concepts/',
            '/docs/topic-docker/',
            '/docs/topic-runtime-env/',
            '/docs/topic-logs/',
            '/docs/topic-security/',
            '/docs/topic-vulnerabilities/',
            '/docs/topic-monitoring/',
            '/docs/topic-domain-names/',
            '/docs/topic-cost/',
            '/docs/topic-rollingupdate/',
            '/docs/topic-uptime/',
            '/docs/topic-radix-cli/',
            '/docs/topic-dynatrace-int/',],
        },
      ],
      '/features/': [
        {
          text: 'List of Features',
          collapsible: false,
          children: [
            '/features/',
          ],
        },
      ],
      '/other/': [
        {
          text: 'Other',
          collapsible: false,
          children: [
            '/other/',
            '/other/scenarios/',
            '/other/community/',
            '/other/release/'
          ],
        },
      ],
      '/references/': [
        {
          text: 'References',
          collapsible: false,
          children: [
            '/references/',
            '/references/reference-radix-config/',
            '/references/reference-code-editor-integration/',
            '/references/reference-private-link/',
          ],
        },
      ]
    },
    colorMode: 'light',
    colorModeSwitch: false,
    themePlugins: {
      nprogress: false,
      mediumZoom: false,
    }
  }),
  markdown: {
    code: {
      lineNumbers: false,
    }
  },
  plugins: [
    registerComponentsPlugin({
      componentsDir: path.resolve(__dirname, './components'),
    }),
    fullTextSearchPlugin(),
  ]
})