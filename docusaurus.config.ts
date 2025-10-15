import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
	title: "Omnia Radix",
	tagline: "Radix makes your app develop",
	favicon: "images/logos/logo.svg",

	// Set the production url of your site here
	url: "https://radix.equinor.com",
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: "/",

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: "Equinor", // Usually your GitHub org/user name.
	projectName: "radix-public-site", // Usually your repo name.

	onBrokenLinks: "throw", //'warn'
	onBrokenMarkdownLinks: "throw",

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: "en",
		locales: ["en"],
	},

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					routeBasePath: "",
				},
				theme: {
					customCss: "./docs/global.css",
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		// Replace with your project's social card
		// image: 'img/docusaurus-social-card.jpg',

		navbar: {
			title: "Omnia Radix",
			logo: {
				alt: "Omnia Radix Logo",
				src: "images/logos/logo.svg",
			},
			items: [
				{ to: "/start", label: "Getting started", position: "left" },
				{ to: "/docs", label: "Docs", position: "left" },
				{ to: "/radix-config", label: "Radix Config", position: "left" },
				{ to: "/guides", label: "Guides", position: "left" },
				{ to: "/features", label: "Features", position: "left" },
				{ to: "/community", label: "Community", position: "left" },
				{
					label: "Web Console",
					href: "https://console.radix.equinor.com/",
					position: "right",
				},
			],
		},
		footer: {
			style: "dark",
			copyright: `Copyright © ${new Date().getFullYear()} Equinor ASA`,
		},
		prism: {
			theme: prismThemes.oceanicNext,
			darkTheme: prismThemes.oceanicNext,
			additionalLanguages: [
				"docker",
				"bash", // also includes shell and sh styles
			],
		},
	} satisfies Preset.ThemeConfig,
	themes: [
		[
			require.resolve("docusaurus-lunr-search"),
			{
				maxHits: 10,
				highlightResult: true,
			},
		],
	],
};

export default config;
