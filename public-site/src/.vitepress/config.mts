import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Omnia Radix",
    description: "Omnia Radix cloud platform",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: "/assets/images/logos/logo.svg",
        search: {
            provider: 'local'
        },
        nav: [
            {text: 'Getting started', link: '/start/'},
            {text: 'Guides', link: '/guides/'},
            {text: 'Docs', link: '/docs/'},
            {text: 'Features', link: '/features/'},
            {text: 'References', link: '/references/'},
            {text: 'Community', link: '/other/'},
            {text: 'Web Console', link: 'https://console.radix.equinor.com/'}
        ],
        sidebar: [
            {
                text: 'Guides',
                link: '/guides/',
                collapsed: true,
                items: [
                    {text: 'Authentication', link: '/guides/authentication/'},
                    {text: 'Workload identity', link: '/guides/workload-identity/'},
                    {text: 'Docker', link: '/guides/docker/'},
                    {text: 'Docker user-add', link: '/guides/docker-useradd/'},
                    {text: 'Azure Key vault', link: '/guides/azure-key-vaults/'},
                    {text: 'Build secrets', link: '/guides/build-secrets/'},
                    {text: 'Environment variables', link: '/guides/environment-variables/'},
                    {text: 'Enable and disable components', link: '/guides/enable-and-disable-components/'},
                    {text: 'External alias', link: '/guides/external-alias/'},
                    {text: 'Start, stop, restart component', link: '/guides/component-start-stop-restart/'},
                    {
                        link: '/guides/jobs/',
                        text: "Jobs",
                        collapsed: true,
                        items: [
                            {text: 'Configure jobs', link: '/guides/jobs/configure-jobs'},
                            {text: 'Job manager and API', link: '/guides/jobs/job-manager-and-job-api'},
                            {text: 'Notifications', link: '/guides/jobs/notifications'},
                            {text: 'Environment variables', link: '/guides/jobs/environment-variables'},
                            {text: 'Jobs in web console', link: '/guides/jobs/jobs-in-web-console'},
                            {text: 'OpenAPI, swagger', link: '/guides/jobs/openapi-swagger'}
                        ]
                    },
                    {
                        link: '/guides/deploy-only/',
                        text: "Deploy only",
                        collapsed: true,
                        items: [
                            {
                                text: '',
                                link: '/guides/deploy-only/example-github-action-to-create-radix-deploy-pipeline-job'
                            },
                            {
                                text: '',
                                link: '/guides/deploy-only/example-github-action-using-ad-service-principal-access-token'
                            },
                            {
                                text: '',
                                link: '/guides/deploy-only/example-github-action-building-and-deploying-application'
                            }]
                    },
                    {text: 'Build and deploy', link: '/guides/build-and-deploy/'},
                    {text: 'Deployment promotion', link: '/guides/deployment-promotion/'},
                    {text: 'Monorepo', link: '/guides/monorepo/'},
                    {text: 'Monitoring', link: '/guides/monitoring/'},
                    {text: 'Resources requests and limits', link: '/guides/resource-request/'},
                    {text: 'Egress', link: '/guides/egress-config/'},
                    {text: 'Git submodules', link: '/guides/git-submodules/'},
                    {
                        text: "Sub-pipeline",
                        link: '/guides/sub-pipeline/',
                        collapsed: true,
                        items: [
                            {link: '/guides/sub-pipeline/#configure-sub-pipeline', text: 'Configure'},
                            {link: '/guides/sub-pipeline/#limitations', text: 'Limitations'},
                            {link: '/guides/sub-pipeline/#hints', text: 'Hints'},
                            {
                                link: '/guides/sub-pipeline/#examples',
                                text: 'Examples',
                                collapsed: true,
                                items: [
                                    {
                                        text: 'Simple sub-pipeline',
                                        link: '/guides/sub-pipeline/example-simple-pipeline.md'
                                    },
                                    {
                                        text: 'Sub-pipeline with multiple tasks',
                                        link: '/guides/sub-pipeline/example-pipeline-with-multiple-tasks.md'
                                    },
                                    {
                                        text: 'Sub-pipeline with multiple task steps',
                                        link: '/guides/sub-pipeline/example-pipeline-with-multiple-task-steps.md'
                                    },
                                    {
                                        text: 'Sub-pipeline with environment variables',
                                        link: '/guides/sub-pipeline/example-pipeline-with-env-vars.md'
                                    },
                                    {
                                        text: 'Sub-pipeline with environment variables for environments',
                                        link: '/guides/sub-pipeline/example-pipeline-with-env-vars-for-envs.md'
                                    },
                                    {
                                        text: 'Sub-pipeline with build secrets',
                                        link: '/guides/sub-pipeline/example-pipeline-with-build-secrets.md'
                                    },
                                    {
                                        text: 'Sub-pipeline with deploy keys',
                                        link: '/guides/sub-pipeline/example-pipeline-with-deploy-keys.md'
                                    },
                                    {
                                        text: 'Sub-pipeline with workload identity',
                                        link: './example-pipeline-with-azure-workload-identity.md'
                                    }]
                            },
                        ]
                    },
                    {text: 'Pipeline badge', link: '/guides/pipeline-badge/'},
                    {text: 'Alerting', link: '/guides/alerting/'},
                    {text: 'Volume mounts', link: '/guides/volume-mounts/'},
                ],
            },
            {
                text: 'Getting started',
                collapsed: true,
                items: [
                    {text: 'Radix concepts', link: '/start/radix-concepts/'},
                    {text: 'Getting access', link: '/start/getting-access/'},
                    {text: 'Requirements', link: '/start/requirements/'},
                    {text: 'Configure application', link: '/start/config-your-app/'},
                    {text: 'Register application', link: '/start/registering-app/'},
                    {text: 'Workflows', link: '/start/workflows/'},
                    {text: 'Radix clusters', link: '/start/radix-clusters/'},
                    {text: 'Onboarding', link: '/start/onboarding/'},
                ],
            },
            {
                text: 'Docs',
                collapsed: true,
                items: [
                    {text: 'Concepts', link: '/docs/topic-concepts/'},
                    {text: 'Docker', link: '/docs/topic-docker/'},
                    {text: 'Runtime environment', link: '/docs/topic-runtime-env/'},
                    {text: 'Logs', link: '/docs/topic-logs/'},
                    {text: 'Security', link: '/docs/topic-security/'},
                    {text: 'Vulnerabilities', link: '/docs/topic-vulnerabilities/'},
                    {text: 'Monitoring', link: '/docs/topic-monitoring/'},
                    {text: 'Domain names', link: '/docs/topic-domain-names/'},
                    {text: 'Cost', link: '/docs/topic-cost/'},
                    {text: 'Rollout updates', link: '/docs/topic-rollingupdate/'},
                    {text: 'Uptime', link: '/docs/topic-uptime/'},
                    {text: 'Radix CLI', link: '/docs/topic-radix-cli/'},
                    {text: 'Integrate Dynatrace in Radix application', link: '/docs/topic-dynatrace-int/'}],
            },
            {text: 'Radix features', link: '/features/'},
            {
                text: 'Community',
                collapsed: true,
                items: [
                    {text: 'Community and Radix team', link: '/other/community/'},
                    {text: 'What`s new', link: '/other/release/'},
                    {text: 'Scenarios', link: '/other/scenarios/'}
                ],
            },
            {
                text: 'References',
                collapsed: true,
                items: [
                    {text: 'Radix configuration', link: '/references/reference-radix-config/'},
                    {text: 'Code editor integration', link: '/references/reference-code-editor-integration/'},
                    {text: 'Private link', link: '/references/reference-private-link/'},
                ],
            }
        ]
    },
    ignoreDeadLinks: true,
})

