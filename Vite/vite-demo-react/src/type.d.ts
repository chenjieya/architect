interface ImportMetaEnv {
  readonly VITE_TITLE: string;
  readonly VITE_PORT: number;
  readonly VITE_OPEN: bollean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
