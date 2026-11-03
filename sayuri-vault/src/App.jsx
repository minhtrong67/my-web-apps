import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Navigate, useParams } from 'react-router-dom'
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { MODULES, getModuleByKey } from './config/modules'
import { configured, auth, provider, logout, allowedEmails } from './firebase'
import { DataProvider } from './data'
import { Icon, Toasts, hue, cookie } from './components/ui'
import Dashboard from './pages/Dashboard'
import ResourcePage from './pages/ResourcePage'
import Settings from './pages/Settings'

function Keyed() {
  const { key } = useParams()
  const m = getModuleByKey(key)
  return m ? <div style={hue(key)}><ResourcePage key={key} m={m} /></div> : <Navigate to="/" replace />
}

function Gate({ title, text, children }) {
  return (
    <div className="login">
      <span className="blob" style={{ clipPath: cookie(9), width: 120, height: 120, background: 'var(--p)', color: 'var(--op)' }}><Icon name="key" /></span>
      <h1 className="h1 s" style={{ flex: 'none', color: 'var(--on)' }}>{title}</h1>
      <p>{text}</p>
      {children}
    </div>
  )
}

function Login() {
  const [err, setErr] = useState('')
  const go = () => signInWithPopup(auth, provider).catch((e) => e.code !== 'auth/popup-closed-by-user' && setErr(e.message))
  return (
    <Gate title="Sayuri Vault" text="Kho dữ liệu cá nhân. Đăng nhập bằng tài khoản Google để tiếp tục.">
      <button className="b f" onClick={go}><Icon name="login" />Đăng nhập với Google</button>
      {err && <p style={{ color: 'var(--err)' }}>{err}</p>}
    </Gate>
  )
}

export default function App() {
  const [user, setUser] = useState(undefined)
  useEffect(() => (configured ? onAuthStateChanged(auth, setUser) : undefined), [])

  if (!configured) return <Gate title="Thiếu cấu hình" text="Điền các biến VITE_FIREBASE_* vào file .env rồi chạy lại npm run dev." />
  if (user === undefined) return <Gate title="Sayuri Vault" text="Đang kiểm tra đăng nhập…" />
  if (!user) return <Login />
  if (allowedEmails.length && !allowedEmails.includes((user.email || '').toLowerCase()))
    return <Gate title="Không có quyền truy cập" text={`${user.email} không nằm trong danh sách được phép.`}><button className="b" onClick={logout}><Icon name="logout" />Đăng xuất</button></Gate>

  return (
    <DataProvider>
      <div className="app">
        <nav className="rail">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'on' : '')}><span className="pill"><Icon name="home" /></span>Tổng quan</NavLink>
          {MODULES.map((m) => (
            <NavLink key={m.key} to={`/${m.key}`} style={hue(m.key)} className={({ isActive }) => (isActive ? 'on' : '')}>
              <span className="pill"><Icon name={m.icon} /></span>{m.label}
            </NavLink>
          ))}
          <span className="sp flex-1" />
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'on' : '')}><span className="pill"><Icon name="settings" /></span>Cài đặt</NavLink>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/:key" element={<Keyed />} />
          </Routes>
        </main>
      </div>
      <Toasts />
    </DataProvider>
  )
}
