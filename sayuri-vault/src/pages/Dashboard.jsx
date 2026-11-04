import { Link } from 'react-router-dom'
import { VISIBLE, STYLE } from '../config/modules'
import { useData } from '../data'
import { Icon, cookie, useCount } from '../components/ui'
import { useT } from '../i18n'

const color = (key) => `oklch(.62 .16 ${STYLE[key].h})`

function Pie({ items, total }) {
  let a = -Math.PI / 2
  const pt = (t) => `${50 + 48 * Math.cos(t)} ${50 + 48 * Math.sin(t)}`
  return (
    <svg viewBox="0 0 100 100" className="pie" role="img">
      {items.map((i, n) => {
        const f = i.n / total, b = a + f * 2 * Math.PI
        const d = `M50 50 L${pt(a)} A48 48 0 ${f > 0.5 ? 1 : 0} 1 ${pt(b)} Z`
        a = b
        const st = { fill: color(i.key), animationDelay: `${n * 70}ms` }
        return f >= 0.9999
          ? <circle key={i.key} cx="50" cy="50" r="48" style={st}><title>{i.label}</title></circle>
          : <path key={i.key} d={d} style={st} stroke="var(--c1)" strokeWidth="1.2"><title>{`${i.label}: ${i.n} (${(f * 100).toFixed(1)}%)`}</title></path>
      })}
    </svg>
  )
}

function Tile({ m, n, ready }) {
  const c = useCount(n)
  return (
    <Link to={`/${m.key}`} className="tile" style={{ '--h': STYLE[m.key].h }}>
      <span className="blob" style={{ clipPath: cookie(STYLE[m.key].l) }}><Icon name={m.icon} size={30} /></span>
      <b>{ready ? c : '–'}</b>
      <span>{m.label}</span>
    </Link>
  )
}

export default function Dashboard() {
  const { data, ready, seed } = useData()
  const t = useT()
  const total = VISIBLE.reduce((a, m) => a + (data[m.key]?.length || 0), 0)
  const all = VISIBLE.every((m) => ready[m.key])
  const items = VISIBLE.map((m) => ({ key: m.key, label: m.label, n: data[m.key]?.length || 0 })).filter((i) => i.n > 0).sort((x, y) => y.n - x.n)

  return (
    <div className="page">
      <header className="head">
        <h1 className="h1">Sayuri Vault</h1>
        <p className="sub">{all ? t('records_in', { n: total, m: VISIBLE.length }) : t('loading')}</p>
      </header>
      {all && !total && (
        <div className="empty big">
          <h2>{t('empty_t')}</h2>
          <p>{t('empty_x')}</p>
          <button className="b p" onClick={seed}><Icon name="cloud_upload" />{t('seed_btn')}</button>
        </div>
      )}
      <div className="grid-t">
        {VISIBLE.map((m) => <Tile key={m.key} m={m} n={data[m.key]?.length || 0} ready={ready[m.key]} />)}
      </div>
      {all && total > 0 && (
        <section className="card chart insight">
          <Pie items={items} total={total} />
          <div className="prog">
            <h3>{t('share')}</h3>
            {items.map((i) => {
              const p = (i.n / total) * 100
              return (
                <div key={i.key} style={{ '--c': color(i.key) }}>
                  <div className="top"><span>{i.label}</span><b>{p.toFixed(1)}%</b></div>
                  <div className="track" role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin="0" aria-valuemax="100" aria-label={i.label}>
                    <span style={{ width: `${p}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
