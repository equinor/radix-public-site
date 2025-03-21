/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEPLOYMENT_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
