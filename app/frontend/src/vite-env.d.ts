/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REQUIRE_APPROVAL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}