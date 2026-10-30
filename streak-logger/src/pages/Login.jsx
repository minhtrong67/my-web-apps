import { useState } from 'react'
import { ShieldCheck, Clock, NotebookText, BarChart3, TriangleAlert, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { isFirebaseConfigured } from '../lib/firebase'
import BrandMark from '../components/BrandMark'
import Button from '../components/ui/Button'
import ThemeSwitcher from '../components/ThemeSwitcher'
import { COOKIE_PATH } from '../theme/brand'

/** Logo Google nhiều màu (lucide không có logo thương hiệu). */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

const HIGHLIGHTS = [
  { icon: Clock, key: 'realtime' },
  { icon: NotebookText, key: 'journal' },
  { icon: BarChart3, key: 'stats' },
]

/** Khối "cookie" trang trí (cùng hình với logo) để tạo chiều sâu cho khung hero. */
function Cookie({ className = '', style }) {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className={`absolute pointer-events-none ${className}`} style={style}>
      <path d={COOKIE_PATH} fill="currentColor" />
    </svg>
  )
}

/** Màn hình đăng nhập bằng Google: hero giới thiệu bên trái, thẻ đăng nhập bên phải (xếp dọc trên mobile). */
export default function Login() {
  const { signInWithGoogle } = useAuth()
  const { t } = useLang()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const handleLogin = async () => {
    setBusy(true)
    const message = await signInWithGoogle()
    setBusy(false)
    if (message) toast.error(message)
  }

  return (
    <div className="min-h-dvh bg-[var(--md-surface)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] lg:flex">
      {/* Hero */}
      <aside className="relative overflow-hidden lg:w-[52%] lg:min-h-dvh bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] rounded-b-[40px] lg:rounded-b-none lg:rounded-r-[56px] px-6 pt-8 pb-10 sm:px-10 lg:px-16 lg:py-16 flex flex-col justify-between gap-10">
        <Cookie className="text-[var(--md-primary)] opacity-15 w-[26rem] -right-24 -top-24 anim-float" />
        <Cookie className="text-[var(--md-tertiary)] opacity-15 w-72 -left-20 -bottom-24" style={{ animation: 'spin-slow 60s linear infinite' }} />

        <div className="relative flex items-center gap-3">
          <BrandMark size={48} />
          <span className="text-xl font-bold tracking-tight">{t('app.name')}</span>
        </div>

        <div className="relative">
          <h1 className="display-title text-4xl sm:text-5xl lg:text-6xl">{t('auth.heroTitle')}</h1>
          <p className="mt-4 max-w-lg text-base sm:text-lg opacity-85 leading-relaxed">{t('auth.heroSubtitle')}</p>

          <ul className="mt-8 grid gap-3 max-w-lg">
            {HIGHLIGHTS.map(({ icon: Icon, key }, i) => (
              <li
                key={key}
                className="stagger-item flex items-center gap-4 rounded-[22px] bg-[color-mix(in_oklab,var(--md-surface)_55%,transparent)] backdrop-blur-sm px-4 py-3.5"
                style={{ '--stagger-delay': `${250 + i * 90}ms` }}
              >
                <span className="w-11 h-11 rounded-[16px] bg-[var(--md-primary)] text-[var(--md-on-primary)] flex items-center justify-center shrink-0">
                  <Icon size={20} />
                </span>
                <span className="text-sm sm:text-base font-semibold">{t(`auth.highlights.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden lg:flex items-center gap-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--md-primary)] text-[var(--md-on-primary)] px-4 py-2"><ShieldCheck size={16} />{t('auth.badgeSecure')}</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--md-surface)] text-[var(--md-on-surface)] px-4 py-2"><RefreshCw size={16} />{t('auth.badgeSync')}</span>
        </div>
      </aside>

      {/* Thẻ đăng nhập */}
      <main className="relative flex-1 flex flex-col">
        <div className="flex justify-end p-4 lg:absolute lg:top-0 lg:right-0">
          <ThemeSwitcher iconOnly />
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-12">
          <div className="page-enter w-full max-w-md rounded-[32px] bg-[var(--md-surface-container-low)] p-7 sm:p-10 flex flex-col">
            <span className="w-14 h-14 rounded-[20px] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] flex items-center justify-center">
              <ShieldCheck size={26} />
            </span>
            <h2 className="display-title mt-5 text-3xl text-[var(--md-on-surface)]">{t('auth.signInTitle')}</h2>
            <p className="mt-2 text-sm text-[var(--md-on-surface-variant)] leading-relaxed">{t('auth.signInHint')}</p>

            {!isFirebaseConfigured && (
              <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-[20px] bg-[var(--md-warning-container)] text-[var(--md-on-warning-container)] text-xs font-medium p-4">
                <TriangleAlert size={16} className="shrink-0 mt-0.5" />
                <span>{t('auth.configMissing')}</span>
              </div>
            )}

            <Button
              size="lg"
              variant="outline"
              className="mt-6 w-full !bg-white !text-zinc-800 !border-zinc-300"
              icon={GoogleLogo}
              loading={busy}
              disabled={!isFirebaseConfigured}
              onClick={handleLogin}
            >
              {busy ? t('auth.signingIn') : t('auth.google')}
            </Button>

            <p className="mt-5 flex items-center gap-2 text-xs text-[var(--md-on-surface-variant)]">
              <ShieldCheck size={15} className="shrink-0 text-[var(--md-primary)]" />
              {t('auth.privacy')}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
