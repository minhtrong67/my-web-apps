// Image hosting through imgbb (https://api.imgbb.com/). The API key comes from VITE_IMGBB_API_KEY (.env).
// Only the resulting URL is stored in Firestore.
const ENDPOINT = 'https://api.imgbb.com/1/upload';
const MAX_INPUT_BYTES = 12 * 1024 * 1024; // refuse absurdly large originals before even decoding
const MAX_SIDE = 1280; // longest edge after downscaling
const QUALITY = 0.85;

export class ImageUploadError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code; // 'noKey' | 'notImage' | 'tooLarge' | 'failed'
  }
}

export const isImgbbConfigured = () => !!import.meta.env.VITE_IMGBB_API_KEY;

/** Downscale + re-encode as JPEG so phone photos (often 5-10 MB) upload quickly. Falls back to the original file. */
async function compress(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // PNGs with transparency would turn black in JPEG
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** Uploads an image File to imgbb and resolves with its public URL. */
export async function uploadImage(file) {
  const key = import.meta.env.VITE_IMGBB_API_KEY;
  if (!key) throw new ImageUploadError('noKey');
  if (!file || !file.type?.startsWith('image/')) throw new ImageUploadError('notImage');
  if (file.size > MAX_INPUT_BYTES) throw new ImageUploadError('tooLarge');

  const body = new FormData();
  body.append('image', await compress(file));
  let res;
  try {
    res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, { method: 'POST', body });
  } catch {
    throw new ImageUploadError('failed');
  }
  const json = await res.json().catch(() => null);
  const url = json?.data?.url || json?.data?.display_url;
  if (!res.ok || !json?.success || !url) throw new ImageUploadError('failed', json?.error?.message);
  return url;
}
