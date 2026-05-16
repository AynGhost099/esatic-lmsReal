/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // autres variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
