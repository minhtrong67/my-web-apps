import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, Confirm } from '../components/ui'
import Select from '../components/Select'
import { flashTip } from '../components/Tooltip'
import RecordDialog from '../components/RecordDialog'
import { useData } from '../data'
import { useLS } from '../useLS'
import { useT, fl } from '../i18n'
import { HIDDEN } from '../config/modules'

function Cell({ f, v }) {
  if (f.type === 'password') return <span>••••••••</span>
  if (f.type === 'url') return <a href={v} target="_blank" rel="noopener noreferrer">{String(v).replace(/^https?:\/\/(www\.)?/, '').slice(0, 52)}</a>
  return v
}

function Rec({ m, r, i, fl: flash, onEdit, onDel, onCopy }) {
  const t = useT()
  const [title, ...rest] = m.fields
  const chips = rest.filter((f) => (f.type === 'select' || f.type === 'reference') && r[f.key])
  const rows = rest.filter((f) => !chips.includes(f) && f.key !== 'note' && r[f.key])
  const cls = (k) => (flash === `${r.id}:${k}` ? 'flash' : '')
  return (
    <article className="rec" style={{ '--i': i }}>
      <header><h3 className={cls(title.key)} data-tip={t('click_copy')} onClick={(e) => onCopy(r, title, e.currentTarget)}>{r[title.key]}</h3></header>
      {chips.length > 0 && <div className="chips">{chips.map((f) => <span key={f.key} className="chip">{r[f.key]}</span>)}</div>}
      {rows.length > 0 && (
        <dl>
          {rows.map((f) => (
            <div key={f.key} className={cls(f.key)} onClick={(e) => !e.target.closest('a') && onCopy(r, f, e.currentTarget)}>
              <dt>{fl(f.label)}</dt><dd className={f.mono ? 'mono' : ''}><Cell f={f} v={r[f.key]} /></dd>
            </div>
          ))}
        </dl>
      )}
      {r.note && <p className="note">{r.note}</p>}
      <div className="ra">
        <button className="ic" data-tip={t('edit')} onClick={() => onEdit(r)}><Icon name="edit" /></button>
        <button className="ic d" data-tip={t('delete')} onClick={() => onDel(r)}><Icon name="delete" /></button>
      </div>
    </article>
  )
}

export default function ResourcePage({ m }) {
  const { data, ready, removeMany, reveal, revealRow } = useData()
  const t = useT()
  const [p, setP] = useLS('sv:' + m.key, { view: 'grid', sort: { f: 'createdAt', d: -1 }, flt: {} })
  const [q, setQ] = useState('')
  const [lim, setLim] = useState(48)
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [fop, setFop] = useState(false)
  const [fl_, setFl] = useState('')
  const fcount = Object.values(p.flt).filter(Boolean).length
  const hidden = HIDDEN.includes(m.key)

  const rows = useMemo(() => {
    const k = q.trim().toLowerCase(), fe = Object.entries(p.flt).filter(([, v]) => v)
    return (data[m.key] || [])
      .filter((r) => (!k || m.fields.some((f) => f.type !== 'password' && String(r[f.key] ?? '').toLowerCase().includes(k)))
        && fe.every(([key, v]) => String(r[key] ?? '').toLowerCase().includes(v.toLowerCase())))
      .sort((a, b) => {
        const x = a[p.sort.f] ?? '', y = b[p.sort.f] ?? ''
        return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'vi', { numeric: true })) * p.sort.d
      })
  }, [data, q, p, m])

  const copy = async (r, f, el) => {
    let v = r[f.key]
    if (!v) return
    if (f.type === 'password') { v = await reveal(v); if (v == null) return }
    await navigator.clipboard.writeText(v)
    setFl(`${r.id}:${f.key}`); setTimeout(() => setFl(''), 1200); flashTip(el, t('copied'))
  }
  const edit = async (r) => {
    if (!r) return setForm({})
    const x = await revealRow(m, r)
    if (x) setForm({ row: x })
  }
  const sorts = [{ v: 'createdAt', l: t('newest') }, ...m.fields.filter((f) => f.type !== 'password').map((f) => ({ v: f.key, l: fl(f.label) }))]
  const setFlt = (k) => (v) => setP({ flt: { ...p.flt, [k]: v } })

  return (
    <div className="page">
      <header className="head">
        {hidden && <Link to="/danbooru_tags" className="b n"><Icon name="back" />Danbooru Tag</Link>}
        <h1 className="h1 s">{m.label}</h1>
        {m.key === 'danbooru_tags' && <Link to="/danbooru_tag_categories" className="b n"><Icon name="account_tree" />{t('cats')}</Link>}
        <div className="tools">
          <label className="search"><Icon name="search" />
            <input type="search" placeholder={t('search_ph')} value={q} onChange={(e) => { setQ(e.target.value); setLim(48) }} /></label>
          <span className="seg">
            {[['grid', 'grid_view', 'view_grid'], ['list', 'view_list', 'view_list']].map(([v, i, k]) =>
              <button key={v} data-tip={t(k)} className={p.view === v ? 'on' : ''} onClick={() => setP({ view: v })}><Icon name={i} /></button>)}
          </span>
          <Select icon="sort" value={p.sort.f} options={sorts} onChange={(v) => setP({ sort: { f: v, d: v === 'createdAt' ? -1 : 1 } })} />
          <button className="ic fill" data-tip={t('reverse')} onClick={() => setP({ sort: { ...p.sort, d: -p.sort.d } })}><Icon name={p.sort.d > 0 ? 'arrow_upward' : 'arrow_downward'} /></button>
          <button className={`b${fop || fcount ? ' p' : ''}`} onClick={() => setFop(!fop)}><Icon name="filter_list" />{t('filters')}{fcount ? ` (${fcount})` : ''}</button>
        </div>
      </header>

      {fop && (
        <div className="card flt">
          {m.fields.filter((f) => f.type !== 'password').map((f) => (
            <label key={f.key} className="fld"><span>{fl(f.label)}</span>
              {f.type === 'select'
                ? <Select value={p.flt[f.key] || ''} onChange={setFlt(f.key)} options={[{ v: '', l: t('all') }, ...f.options]} />
                : <input value={p.flt[f.key] || ''} onChange={(e) => setFlt(f.key)(e.target.value)} placeholder={t('contains')} />}
            </label>
          ))}
          <button className="b n" disabled={!fcount} onClick={() => setP({ flt: {} })}><Icon name="filter_alt_off" />{t('filters_clear')}</button>
        </div>
      )}

      {!ready[m.key] ? <div className={`recs ${p.view}`}>{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="rec sk" />)}</div>
        : !rows.length ? (
          <div className="card empty"><Icon name={m.icon} size={44} />
            <b>{q || fcount ? t('no_match') : t('no_rec')}</b>
            <span>{q || fcount ? t('try_other') : t('add_hint')}</span></div>
        ) : (
          <>
            <div className={`recs ${p.view}`}>
              {rows.slice(0, lim).map((r, i) => <Rec key={r.id} m={m} r={r} i={i} fl={fl_} onEdit={edit} onDel={setDel} onCopy={copy} />)}
            </div>
            <p className="foot">{t(q || fcount ? 'count_match' : 'count', { n: rows.length })} · {t('copy_hint')}
              {rows.length > lim && <button className="b n" onClick={() => setLim(lim + 48)}><Icon name="down" />{t('more', { n: rows.length - lim })}</button>}</p>
          </>
        )}

      <button className="fab" onClick={() => edit()}><Icon name="add" size={22} />{t('add')}</button>

      {form && <RecordDialog m={m} row={form.row} onClose={() => setForm(null)} />}
      {del && <Confirm title={t('del_t')} text={t('del_x')} label={t('delete')} icon="delete" onClose={() => setDel(null)}
        onConfirm={async () => { await removeMany(m, [del]); setDel(null) }} />}
    </div>
  )
}
