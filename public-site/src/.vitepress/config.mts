import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Omnia Radix",
    description: "Omnia Radix cloud platform",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: 'Getting started', link: '/start/index.md'},
            {text: 'Guides', link: '/guides/index.md'},
            {text: 'Docs', link: '/docs/index.md'},
            {text: 'Features', link: '/features/index.md'},
            {text: 'References', link: '/references/index.md'},
            {text: 'Community', link: '/other/index.md'},
            {text: 'Web Console', link: 'https://github.com/vuejs/vitepress'}
        ],
        sidebar: [
            {
                text: '', link: '/guides/',
                items: [
                    {
                        text: 'Guides',
                        items: [
                            {text: '', link: '/guides/'},
                            {text: '', link: '/guides/authentication/'},
                            {text: '', link: '/guides/workload-identity/'},
                            {text: '', link: '/guides/docker/'},
                            {text: '', link: '/guides/docker-useradd/'},
                            {text: '', link: '/guides/azure-key-vaults/'},
                            {text: '', link: '/guides/build-secrets/'},
                            {text: '', link: '/guides/environment-variables/'},
                            {text: '', link: '/guides/enable-and-disable-components/'},
                            {text: '', link: '/guides/external-alias/'},
                            {text: '', link: '/guides/component-start-stop-restart/'},
                            {
                                link: '/guides/jobs/',
                                text: "Jobs",
                                items: [
                                    {text: '', link: '/guides/jobs/configure-jobs'},
                                    {text: '', link: '/guides/jobs/job-manager-and-job-api'},
                                    {text: '', link: '/guides/jobs/notifications'},
                                    {text: '', link: '/guides/jobs/environment-variables'},
                                    {text: '', link: '/guides/jobs/jobs-in-web-console'},
                                    {text: '', link: '/guides/jobs/openapi-swagger'}
                                ]
                            },
                            {
                                link: '/guides/deploy-only/',
                                text: "Deploy only",
                                items: [
                                    {
                                        text: '', link: '/guides/deploy-only/',
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
                                    {text: '', link: '/guides/build-and-deploy/'},
                                    {text: '', link: '/guides/deployment-promotion/'},
                                    {text: '', link: '/guides/monorepo/'},
                                    {text: '', link: '/guides/monitoring/'},
                                    {text: '', link: '/guides/resource-request/'},
                                    {text: '', link: '/guides/egress-config/'},
                                    {text: '', link: '/guides/git-submodules/'},
                                    {
                                        link: '/guides/sub-pipeline/',
                                        text: "Sub-pipeline",
                                        items: [
                                            {link: '/guides/sub-pipeline/#configure-sub-pipeline', text: 'Configure'},
                                            {link: '/guides/sub-pipeline/#limitations', text: 'Limitations'},
                                            {link: '/guides/sub-pipeline/#hints', text: 'Hints'},
                                            {
                                                link: '/guides/sub-pipeline/#examples',
                                                text: 'Examples',
                                                items: [
                                                    {text: '', link: '/guides/sub-pipeline/example-simple-pipeline.md'},
                                                    {
                                                        text: '',
                                                        link: '/guides/sub-pipeline/example-pipeline-with-multiple-tasks.md'
                                                    },
                                                    {
                                                        text: '',
                                                        link: '/guides/sub-pipeline/example-pipeline-with-multiple-task-steps.md'
                                                    },
                                                    {
                                                        text: '',
                                                        link: '/guides/sub-pipeline/example-pipeline-with-env-vars.md'
                                                    },
                                                    {
                                                        text: '',
                                                        link: '/guides/sub-pipeline/example-pipeline-with-env-vars-for-envs.md'
                                                    },
                                                    {
                                                        text: '',
                                                        link: '/guides/sub-pipeline/example-pipeline-with-build-secrets.md'
                                                    },
                                                    {
                                                        text: '',
                                                        link: '/guides/sub-pipeline/example-pipeline-with-deploy-keys.md'
                                                    },
                                                    {
                                                        text: '',
                                                        link: './example-pipeline-with-azure-workload-identity.md'
                                                    }]
                                            },
                                        ]
                                    },
                                    {text: '', link: '/guides/pipeline-badge/'},
                                    {text: '', link: '/guides/alerting/'},
                                    {text: '', link: '/guides/volume-mounts/'},
                                ],
                            },
                        ]
                    },
                    {
                        text: '', link: '/start/',
                        items: [
                            {
                                text: 'Getting started',

                                items: [
                                    {text: '', link: '/start/'},
                                    {text: '', link: '/start/radix-concepts/'},
                                    {text: '', link: '/start/getting-access/'},
                                    {text: '', link: '/start/requirements/'},
                                    {text: '', link: '/start/config-your-app/'},
                                    {text: '', link: '/start/registering-app/'},
                                    {text: '', link: '/start/workflows/'},
                                    {text: '', link: '/start/radix-clusters/'},
                                    {text: '', link: '/start/onboarding/'},
                                ],
                            },
                        ]
                    },
                    {
                        text: '', link: '/docs/', items: [
                            {
                                text: 'Docs',

                                items: [
                                    {text: '', link: '/docs/'},
                                    {text: '', link: '/docs/topic-concepts/'},
                                    {text: '', link: '/docs/topic-docker/'},
                                    {text: '', link: '/docs/topic-runtime-env/'},
                                    {text: '', link: '/docs/topic-logs/'},
                                    {text: '', link: '/docs/topic-security/'},
                                    {text: '', link: '/docs/topic-vulnerabilities/'},
                                    {text: '', link: '/docs/topic-monitoring/'},
                                    {text: '', link: '/docs/topic-domain-names/'},
                                    {text: '', link: '/docs/topic-cost/'},
                                    {text: '', link: '/docs/topic-rollingupdate/'},
                                    {text: '', link: '/docs/topic-uptime/'},
                                    {text: '', link: '/docs/topic-radix-cli/'},
                                    {text: '', link: '/docs/topic-dynatrace-int/'}],
                            },
                        ]
                    },
                    {
                        text: '', link: '/features/',
                        items: [
                            {
                                text: 'List of Features',
                                items: [
                                    {text: '', link: '/features/'}],
                            },
                        ]
                    },
                    {
                        text: '', link: '/other/',
                        items: [
                            {
                                text: 'Community',

                                items: [
                                    {text: '', link: '/other/community/'},
                                    {text: '', link: '/other/release/'},
                                    {text: '', link: '/other/scenarios/'}
                                ],
                            },
                        ]
                    },
                    {
                        text: '', link: '/references/', items: [
                            {
                                text: 'References',

                                items: [
                                    {text: '', link: '/references/'},
                                    {text: '', link: '/references/reference-radix-config/'},
                                    {text: '', link: '/references/reference-code-editor-integration/'},
                                    {text: '', link: '/references/reference-private-link/'},
                                ],
                            },
                        ]
                    }

                ]
            }],
    },
    ignoreDeadLinks: true,
})

