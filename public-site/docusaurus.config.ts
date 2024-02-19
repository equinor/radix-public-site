import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Welcome to Radix',
  tagline: 'Radix makes your app develop',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://radix.equinor.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Equinor', // Usually your GitHub org/user name.
  projectName: 'radix-public-site', // Usually your repo name.

  onBrokenLinks: 'warn',//originally: throw
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
        },
        blog: {
          showReadingTime: false,
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
    navbar: {
      title: 'Omnia Radix',
      logo: {
        alt: 'Omnia Radix Logo',
        src: 'images/logos/logo.svg',
      },
      items: [
        {to: '/docs/start', label: 'Getting started', position: 'right'},
        {to: '/docs/guides', label: 'Guides', position: 'right'},
        {to: '/docs/docs', label: 'Docs', position: 'right'},
        {to: '/docs/features', label: 'Features', position: 'right'},
        {to: '/docs/references', label: 'References', position: 'right'},
        {to: '/docs/other', label: 'Community', position: 'right'},
        {href: 'https://console.radix.equinor.com/', label: 'Web Console', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Equinor ASA`,
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  themes: [
    // ... Your other themes.
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        // For Docs using Chinese, The `language` is recommended to set to:
        // ```
        // language: ["en", "zh"],
        // ```
      }),
    ],
  ],
};

export default config;
