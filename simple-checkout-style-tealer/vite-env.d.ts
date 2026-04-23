/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAGADA_STORE_ID?: string;
  readonly VITE_TAGADA_ACCOUNT_ID?: string;
  readonly VITE_TAGADA_BASE_PATH?: string;
  readonly VITE_TAGADA_ENV?: string;
  readonly VITE_TAGADA_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}