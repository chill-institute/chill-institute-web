interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_BASE_URL?: string;
  readonly VITE_PUBLIC_RELEASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
