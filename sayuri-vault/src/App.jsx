import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { VISIBLE, STYLE, getModuleByKey } from './config/modules'
import { configured, auth, provider, logout, allowedEmails } from './firebase'
import { DataProvider } from './data'
import { Icon, Toasts, Modal, hue, cookie } from './components/ui'
import Tooltip from './components/Tooltip'
import VaultDialog from './components/VaultDialog'
import Dashboard from './pages/Dashboard'
import ResourcePage from './pages/ResourcePage'
import Settings from './pages/Settings'
import { useLS } from './useLS'
import { useT } from './i18n'

function Keyed() {
  const { key } = useParams()
  const m = getModuleByKey(key)
  return m ? <div style={hue(key)}><ResourcePage key={key} m={m} /></div> : <Navigate to="/" replace />
}

function Gate({ title, text, children }) {
  return (
    <div className="login">
      <span className="blob" style={{ clipPath: cookie(9), width: 120, height: 120, background: 'var(--p)', color: 'var(--op)' }}><Icon name="key" size={44} /></span>
      <h1 className="h1 s" style={{ flex: 'none', color: 'var(--on)' }}>{title}</h1>
      <p>{text}</p>
      {children}
    </div>
  )
}

function Login() {
  const t = useT()
  const [err, setErr] = useState('')
  const go = () => signInWithPopup(auth, provider).catch((e) => e.code !== 'auth/popup-closed-by-user' && setErr(e.message))
  return (
    <Gate title="Sayuri Vault" text={t('signin_text')}>
      <button className="b p" onClick={go}><Icon name="login" />{t('signin_btn')}</button>
      {err && <p className="errt">{err}</p>}
    </Gate>
  )
}

// Bảng chọn danh mục (mobile)
function Sheet({ onClose }) {
  const nav = useNavigate()
  const t = useT()
  const go = (to) => { onClose(); nav(to) }
  return (
    <Modal onClose={onClose}>
      <h2><Icon name="apps" size={26} />{t('menu')}</h2>
      <div className="jump">
        {VISIBLE.map((m) => <button key={m.key} style={{ '--h': STYLE[m.key].h }} onClick={() => go(`/${m.key}`)}><Icon name={m.icon} />{m.label}</button>)}
      </div>
      <div className="btns"><button className="b n" onClick={onClose}><Icon name="close" />{t('cancel')}</button></div>
    </Modal>
  )
}

function Shell() {
  const t = useT()
  const loc = useLocation()
  const [ui, setUi] = useLS('sv_ui', { min: false })
  const [sheet, setSheet] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [top, setTop] = useState(false)

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false), sc = () => setTop(scrollY > 320)
    const ripple = (e) => {
      const el = e.target.closest('.b,.ic,.fab,.ni,.seg button,.sw button,.totop')
      if (!el || el.disabled) return
      const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = document.createElement('span')
      s.className = 'rp'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`
      el.append(s); setTimeout(() => s.remove(), 650)
    }
    addEventListener('online', on); addEventListener('offline', off); addEventListener('scroll', sc, { passive: true }); document.addEventListener('pointerdown', ripple)
    return () => { removeEventListener('online', on); removeEventListener('offline', off); removeEventListener('scroll', sc); document.removeEventListener('pointerdown', ripple) }
  }, [])
  useEffect(() => { scrollTo(0, 0) }, [loc.pathname])

  const cls = ({ isActive }) => `ni${isActive ? ' on' : ''}`
  const tip = (label) => (ui.min ? { 'data-tip': label, 'data-tip-side': 'right' } : {})
  return (
    <>
      {!online && <div className="offline"><Icon name="cloud_off" />{t('offline')}</div>}
      <div className={`app${ui.min ? ' min' : ''}`}>
        <nav className="rail">
          <div className="brand">
            <span className="logo" style={{ clipPath: cookie(9) }}><Icon name="key" size={22} /></span>
            <b>Sayuri Vault</b>
            <button className="ic" data-tip={t(ui.min ? 'expand' : 'collapse')} data-tip-side="right" onClick={() => setUi({ min: !ui.min })}>
              <Icon name={ui.min ? 'right' : 'left'} /></button>
          </div>
          <NavLink to="/" end className={cls} {...tip(t('home'))}><Icon name="home" size={22} /><span className="lbl">{t('home')}</span></NavLink>
          <div className="sep" />
          {VISIBLE.map((m) => (
            <NavLink key={m.key} to={`/${m.key}`} style={hue(m.key)} className={(s) => `${cls(s)} mod`} {...tip(m.label)}>
              <Icon name={m.icon} size={22} /><span className="lbl">{m.label}</span>
            </NavLink>
          ))}
          <button className="ni cats" onClick={() => setSheet(true)}><Icon name="apps" size={22} /><span className="lbl">{t('menu')}</span></button>
          <span className="sp" />
          <NavLink to="/settings" className={cls} {...tip(t('settings'))}><Icon name="settings" size={22} /><span className="lbl">{t('settings')}</span></NavLink>
        </nav>
        <main>
          <div key={loc.pathname} className="route">
            <Routes location={loc}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/:key" element={<Keyed />} />
            </Routes>
          </div>
        </main>
      </div>
      <button className={`totop${top ? ' show' : ''}`} data-tip={t('top')} aria-label={t('top')} onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}><Icon name="up" size={22} /></button>
      {sheet && <Sheet onClose={() => setSheet(false)} />}
      <VaultDialog />
      <Toasts />
    </>
  )
}

export default function App() {
  const t = useT()
  const [user, setUser] = useState(undefined)
  useEffect(() => (configured ? onAuthStateChanged(auth, setUser) : undefined), [])

  let gate = null
  if (!configured) gate = <Gate title={t('cfg_t')} text={t('cfg_x')} />
  else if (user === undefined) gate = <Gate title="Sayuri Vault" text={t('checking')} />
  else if (!user) gate = <Login />
  else if (allowedEmails.length && !allowedEmails.includes((user.email || '').toLowerCase()))
    gate = <Gate title={t('denied_t')} text={t('denied_x', { email: user.email })}><button className="b e" onClick={logout}><Icon name="logout" />{t('signout')}</button></Gate>
  return <>{gate || <DataProvider><Shell /></DataProvider>}<Tooltip /></>
}
