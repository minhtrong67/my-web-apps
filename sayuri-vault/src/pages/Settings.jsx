import { useAppearance, COLORS, FONTS } from '../appearance'
import { auth, logout } from '../firebase'
import { useData } from '../data'
import { Icon, cookie } from '../components/ui'
import Select from '../components/Select'
import DataTools from '../components/DataTools'
import { useT } from '../i18n'

const THEMES = [['light', 'light', 'light_mode'], ['dark', 'dark', 'dark_mode'], ['system', 'system', 'contrast']]
const cname = (id) => id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
const SIZES = [['sm', 'small', 14], ['md', 'medium', 17], ['lg', 'large', 20]]

export default function Settings() {
  const [a, set] = useAppearance()
  const { seed, total, migrate, lock } = useData()
  const t = useT()
  const u = auth.currentUser
  const title = (icon, k) => <h3><Icon name={icon} size={22} />{t(k)}</h3>
  return (
    <div className="page center">
      <header className="head"><h1 className="h1 s">{t('settings')}</h1></header>
      <div className="set">
        <section className="sec">{title('user', 'account')}
          <div className="who">
            {u.photoURL && <img src={u.photoURL} alt="" referrerPolicy="no-referrer" />}
            <div><b>{u.displayName}</b><p>{u.email}</p></div>
            <button className="b e" onClick={logout}><Icon name="logout" />{t('signout')}</button>
          </div>
        </section>

        <section className="sec">{title('palette', 'appearance')}
          <label className="lab">{t('mode')}</label>
          <div className="seg wide">{THEMES.map(([v, k, i]) => <button key={v} className={a.theme === v ? 'on' : ''} onClick={() => set({ theme: v })}><Icon name={i} />{t(k)}</button>)}</div>
          <label className="lab">{t('color')}</label>
          <div className="sw">{COLORS.map(([id, h, c]) => (
            <button key={id} className={a.color === id ? 'on' : ''} style={{ '--sc': `oklch(.55 ${0.17 * c} ${h})` }} onClick={() => set({ color: id })} aria-pressed={a.color === id}>
              <Icon name="check" size={16} />{cname(id)}
            </button>))}</div>
          <label className="lab">{t('fsize')}</label>
          <div className="seg wide">{SIZES.map(([v, k, px]) => <button key={v} className={a.size === v ? 'on' : ''} onClick={() => set({ size: v })}><span style={{ fontSize: px, fontWeight: 700 }}>A</span>{t(k)}</button>)}</div>
          <div className="two">
            <div><label className="lab">{t('lang')}</label>
              <div className="seg wide">{[['vi', 'Tiếng Việt'], ['en', 'English']].map(([v, l]) => <button key={v} className={a.lang === v ? 'on' : ''} onClick={() => set({ lang: v })}>{l}</button>)}</div></div>
            <div><label className="lab">{t('font')}</label>
              <Select icon="type" value={a.font} onChange={(v) => set({ font: v })} options={FONTS.map(([v, l]) => ({ v, l }))} /></div>
          </div>
        </section>

        <section className="sec">{title('database', 'data')}
          <p className="mu">{t('data_x')} {t('count', { n: total })}</p>
          <DataTools />
          <div className="seg" style={{ marginTop: 14 }}>
            <button onClick={seed}><Icon name="cloud_upload" />{t('seed_btn')}</button>
            <button onClick={migrate}><Icon name="enhanced_encryption" />{t('enc_old')}</button>
            <button onClick={lock}><Icon name="lock" />{t('lock_now')}</button>
          </div>
        </section>

        <section className="author">
          <span className="aav" style={{ clipPath: cookie(9) }}><Icon name="sparkles" size={30} /></span>
          <div>
            <small>{t('made')}</small>
            <h3>sayuri67</h3>
            <p><Icon name="bot" size={18} />{t('ai')} <b>Claude</b> <Icon name="heart" size={16} /></p>
          </div>
        </section>
      </div>
    </div>
  )
}
