/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY?: string;
  readonly VITE_OPENROUTER_CHAT_MODEL?: string;
  readonly VITE_OPENROUTER_IMAGE_MODEL?: string;
  readonly VITE_OPENROUTER_REFERER?: string;
  readonly VITE_OPENROUTER_APP_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
