/**
 * Direct, client-side upload to Cloudinary using an **unsigned upload preset**
 * (docs/07-settings — see the Settings-page section). This avoids ever putting a
 * Cloudinary API secret in the frontend or backend: the preset itself (configured
 * in the Cloudinary dashboard) restricts what an unsigned upload may do — e.g. cap
 * file size/type and lock the destination folder.
 *
 * Requires two public, non-secret values in `frontend/.env`:
 *   VITE_CLOUDINARY_CLOUD_NAME=<your cloud name>
 *   VITE_CLOUDINARY_UPLOAD_PRESET=<an unsigned preset you created>
 */
export class CloudinaryNotConfiguredError extends Error {
  constructor() {
    super('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
    this.name = 'CloudinaryNotConfiguredError';
  }
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
}

export async function uploadAvatar(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new CloudinaryNotConfiguredError();
  }

  // The destination folder is deliberately NOT set here — it's owned by the upload
  // preset's own `asset_folder` config in the Cloudinary dashboard. Sending a client
  // `folder` alongside a preset that already fixes one can conflict; the preset wins.
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? 'Avatar upload failed.');
  }
  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}
