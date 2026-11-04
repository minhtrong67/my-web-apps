// Image hosting through imgbb (https://api.imgbb.com/). The API key comes from VITE_IMGBB_API_KEY (.env).
// Only the resulting URL is stored in Firestore.
const ENDPOINT = 'https://api.imgbb.com/1/upload';
const MAX_INPUT_BYTES = 12 * 1024 * 1024; // refuse absurdly large originals before even decoding
export const MAX_IMAGE_BYTES = MAX_INPUT_BYTES;
const MAX_SIDE = 1280; // longest edge after downscaling
const QUALITY = 0.85;

export class ImageUploadError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code; // 'noKey' | 'notImage' | 'tooLarge' | 'failed' | 'aborted'
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

/** POST through XMLHttpRequest (fetch can't report upload progress). Resolves { ok, json }. */
function send(url, body, { onProgress, signal }) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new ImageUploadError('aborted'));
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.responseType = 'text';
    xhr.timeout = 90_000;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) onProgress?.(Math.min(1, e.loaded / e.total));
    };
    xhr.onload = () => {
      let json = null;
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        /* not JSON - treated as a failure below */
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, json });
    };
    xhr.onerror = () => reject(new ImageUploadError('failed'));
    xhr.ontimeout = () => reject(new ImageUploadError('failed'));
    xhr.onabort = () => reject(new ImageUploadError('aborted'));
    signal?.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send(body);
  });
}

/**
 * Uploads an image File to imgbb and resolves with its public URL.
 * options.onProgress(0..1) reports the bytes sent; options.signal (AbortSignal) cancels the upload
 * (rejects with code 'aborted').
 */
export async function uploadImage(file, { onProgress, signal } = {}) {
  const key = import.meta.env.VITE_IMGBB_API_KEY;
  if (!key) throw new ImageUploadError('noKey');
  if (!file || !file.type?.startsWith('image/')) throw new ImageUploadError('notImage');
  if (file.size > MAX_INPUT_BYTES) throw new ImageUploadError('tooLarge');

  const body = new FormData();
  body.append('image', await compress(file));
  const { ok, json } = await send(`${ENDPOINT}?key=${encodeURIComponent(key)}`, body, { onProgress, signal });
  const url = json?.data?.url || json?.data?.display_url;
  if (!ok || !json?.success || !url) throw new ImageUploadError('failed', json?.error?.message);
  return url;
}
