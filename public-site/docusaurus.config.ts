import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Omnia Radix',
  tagline: 'Radix makes your app develop',
  favicon: 'images/logos/logo.svg',

  // Set the production url of your site here
  url: 'https://radix.equinor.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Equinor', // Usually your GitHub org/user name.
  projectName: 'radix-public-site', // Usually your repo name.

  onBrokenLinks: 'throw', //'warn'
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    // image: 'img/docusaurus-social-card.jpg',
    
    metadata:[
      {"http-equiv": 'Content-Security-Policy', content: `default-src 'self';script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none'; img-src 'self' data:; style-src 'self' https://cdn.eds.equinor.com/font/; font-src 'self' https://cdn.eds.equinor.com/font/; upgrade-insecure-requests; block-all-mixed-content`},
      {"http-equiv": 'Permissions-Policy', content: 'none'},
      {"http-equiv": 'Cross-Origin-Resource-Policy', content: 'same-origin'},
      {"http-equiv": 'Referrer-Policy', content: 'no-referrer'},
      {"http-equiv": 'X-Content-Type-Options', content: 'nosniff'},
      {"http-equiv": 'X-Permitted-Cross-Domain-Policies', content: 'none'},
    ],

    navbar: {
      title: 'Omnia Radix',
      logo: {
        alt: 'Omnia Radix Logo',
        src: 'images/logos/logo.svg',
      },
      items: [
        {to: '/start', label: 'Getting started', position: 'right'},
        {to: '/docs', label: 'Docs', position: 'right'},
        {to: '/radix-config', label: 'Radix Config', position: 'right'},
        {to: '/guides', label: 'Guides', position: 'right'},
        {to: '/features', label: 'Features', position: 'right'},
        {to: '/community', label: 'Community', position: 'right'},
        {href: 'https://console.radix.equinor.com/', label: 'Web Console', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Equinor ASA`,
    },
    prism: {
      theme: prismThemes.oceanicNext,
      darkTheme: prismThemes.oceanicNext,
      additionalLanguages: [
        'docker',
        'bash', // also includes shell and sh styles
      ]
    },
  } satisfies Preset.ThemeConfig,
  themes: [
    [
      require.resolve('docusaurus-lunr-search'),
      ({
        maxHits: 10,
        highlightResult: true,
      }),
    ],
  ],
};

export default config;
