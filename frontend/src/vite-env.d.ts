/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** Cloudinary cloud name — used for direct, unsigned avatar uploads (Settings page). */
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  /** An unsigned upload preset created in the Cloudinary dashboard. */
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
