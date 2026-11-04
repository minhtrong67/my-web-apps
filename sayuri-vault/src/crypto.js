// Mã hoá mật khẩu phía trình duyệt: PBKDF2 (250k vòng) → AES-GCM 256. Firestore chỉ chứa "enc:v1:<iv>:<ciphertext>".
const te = new TextEncoder(), td = new TextDecoder()
export const b64 = (u) => btoa(String.fromCharCode(...u))
export const ub = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
export const isEnc = (v) => typeof v === 'string' && v.startsWith('enc:v1:')
export const newSalt = () => crypto.getRandomValues(new Uint8Array(16))

export async function deriveKey(pass, salt) {
  const base = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}
export async function encrypt(key, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(text)))
  return `enc:v1:${b64(iv)}:${b64(ct)}`
}
export async function decrypt(key, v) {
  const [, , iv, ct] = v.split(':')
  return td.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub(iv) }, key, ub(ct)))
}
