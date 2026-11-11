import { registerSW } from 'virtual:pwa-register'

let update = () => {}
let deferred = null
const emit = (type) => window.dispatchEvent(new CustomEvent('al-pwa', { detail: type }))

export function registerPwa() {
  update = registerSW({ onNeedRefresh: () => emit('update'), onOfflineReady: () => emit('offline-ready') })
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; emit('installable') })
  window.addEventListener('appinstalled', () => { deferred = null; emit('installed') })
}
export const applyUpdate = () => update(true)
export const canInstall = () => !!deferred
export async function promptInstall() {
  if (!deferred) return false
  deferred.prompt()
  const r = await deferred.userChoice
  deferred = null
  return r.outcome === 'accepted'
}
