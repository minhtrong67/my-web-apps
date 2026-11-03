import { useAppearance } from '../appearance'
import { auth, logout } from '../firebase'
import { useData } from '../data'
import { Icon } from '../components/ui'

const HUES = [350, 20, 75, 150, 200, 255, 300, 330]
const THEMES = [['light', 'Sáng', 'light_mode'], ['dark', 'Tối', 'dark_mode'], ['system', 'Theo hệ thống', 'contrast']]

export default function Settings() {
  const [a, set] = useAppearance()
  const u = auth.currentUser
  const { seed, total } = useData()
  return (
    <div className="page">
      <header className="head"><h1 className="h1 s" style={{ color: 'var(--on)' }}>Cài đặt</h1></header>
      <div className="set">
        <section className="card sec"><h3>Tài khoản</h3>
          <div className="who">
            {u.photoURL && <img src={u.photoURL} alt="" referrerPolicy="no-referrer" />}
            <div><b>{u.displayName}</b><p>{u.email}</p></div>
            <button className="b" onClick={logout}><Icon name="logout" />Đăng xuất</button>
          </div>
        </section>
        <section className="card sec"><h3>Chế độ hiển thị</h3>
          <div className="seg">{THEMES.map(([t, l, i]) => <button key={t} className={a.theme === t ? 'on' : ''} onClick={() => set({ theme: t })}><Icon name={i} />{l}</button>)}</div>
        </section>
        <section className="card sec"><h3>Màu chủ đạo</h3>
          <div className="sw">{HUES.map((h) => <button key={h} className={a.hue === h ? 'on' : ''} style={{ '--s': h }} onClick={() => set({ hue: h })} aria-label={`Màu ${h}`}><Icon name="check" /></button>)}</div>
        </section>
        <section className="card sec"><h3>Dữ liệu</h3>
          <p style={{ color: 'var(--mu)', marginBottom: 12 }}>Hiện có {total} bản ghi. Nạp dữ liệu từ CSV chỉ bổ sung vào những bộ sưu tập đang trống.</p>
          <button className="b" onClick={seed}><Icon name="cloud_upload" />Nạp dữ liệu từ CSV</button>
        </section>
      </div>
    </div>
  )
}
