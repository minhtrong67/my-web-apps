import { Link } from 'react-router-dom'
import { MODULES, STYLE } from '../config/modules'
import { useData } from '../data'
import { Icon, cookie } from '../components/ui'

export default function Dashboard() {
  const { data, ready, all, total, seed } = useData()
  return (
    <div className="page">
      <header className="head">
        <h1 className="h1">Sayuri Vault</h1>
        <p className="sub">{all ? `${total} bản ghi trong ${MODULES.length} bộ sưu tập` : 'Đang tải dữ liệu…'}</p>
      </header>
      {all && !total && (
        <div className="empty big">
          <h2>Kho đang trống</h2>
          <p>Nạp sẵn 274 bản ghi từ 8 file CSV vào Firestore chỉ với một lần bấm.</p>
          <button className="b f" onClick={seed}><Icon name="cloud_upload" />Nạp dữ liệu từ CSV</button>
        </div>
      )}
      <div className="grid-t">
        {MODULES.map((m) => (
          <Link key={m.key} to={`/${m.key}`} className="tile" style={{ '--h': STYLE[m.key].h }}>
            <span className="blob" style={{ clipPath: cookie(STYLE[m.key].l) }}><Icon name={m.icon} /></span>
            <b>{ready[m.key] ? data[m.key].length : '–'}</b>
            <span>{m.label}</span>
          </Link>
        ))}
      </div>
      {all && total > 0 && (
        <section className="card chart">
          <h3>Tỉ lệ dữ liệu</h3>
          {[...MODULES].sort((a, b) => data[b.key].length - data[a.key].length).map((m) => (
            <div key={m.key} className="bar" style={{ '--h': STYLE[m.key].h }}>
              <span>{m.label}</span>
              <div><span className="fill" style={{ width: `${(data[m.key].length / Math.max(...MODULES.map((x) => data[x.key].length))) * 100}%` }} /></div>
              <b>{data[m.key].length}</b>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
