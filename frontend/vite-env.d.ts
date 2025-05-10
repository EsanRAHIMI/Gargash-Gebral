/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_URL: string
  readonly VITE_BACKEND_URL: string
  readonly VITE_AUTH_URL: string
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 