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

// Field URL: không hiện đường dẫn, chỉ có nút mở tab mới + nút sao chép
function Url({ v, onCopy, compact }) {
  const t = useT()
  const c = compact ? 'ic' : 'b s'
  return (
    <span className="urlb">
      <a className={c} href={v} target="_blank" rel="noopener noreferrer" data-tip={compact ? t('open') : v}><Icon name="open" size={compact ? 18 : 15} />{!compact && t('open')}</a>
      <button className={c} data-tip={compact ? t('copy_url') : undefined} onClick={(e) => onCopy(e.currentTarget)}><Icon name="copy" size={compact ? 18 : 15} />{!compact && t('copy_url')}</button>
    </span>
  )
}

function Cell({ f, v, onCopy, compact }) {
  if (f.type === 'password') return <span>••••••••</span>
  if (f.type === 'url') return <Url v={v} onCopy={onCopy} compact={compact} />
  if (f.type === 'select' || f.type === 'reference') return <span className="chip">{v}</span>
  return v
}

export function Rec({ m, r, i, fl: flash, onEdit, onDel, onCopy }) {
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
            <div key={f.key} className={`${cls(f.key)}${f.type === 'url' ? ' u' : ''}`} onClick={f.type === 'url' ? undefined : (e) => onCopy(r, f, e.currentTarget)}>
              <dt>{fl(f.label)}</dt>
              <dd className={f.mono ? 'mono' : ''}><Cell f={f} v={r[f.key]} onCopy={(el) => onCopy(r, f, el)} /></dd>
            </div>
          ))}
        </dl>
      )}
      {r.note && <p className="note">{r.note}</p>}
      <div className="ra">
        <button className="b s" onClick={() => onEdit(r)}><Icon name="edit" size={16} />{t('edit')}</button>
        <button className="b s eo" onClick={() => onDel(r)}><Icon name="delete" size={16} />{t('delete')}</button>
      </div>
    </article>
  )
}

export function DataTable({ m, rows, sort, onSort, fl: flash, onEdit, onDel, onCopy }) {
  const t = useT()
  return (
    <div className="card tbl">
      <table>
        <thead><tr>
          <th className="n">#</th>
          {m.fields.map((f) => (
            <th key={f.key} className={sort.f === f.key ? 'on' : ''} onClick={f.type === 'password' ? undefined : () => onSort(f.key)}>
              {fl(f.label)}{sort.f === f.key && <Icon name={sort.d > 0 ? 'arrow_upward' : 'arrow_downward'} size={14} />}
            </th>
          ))}
          <th className="act" />
        </tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} style={{ '--i': i }}>
              <td className="n">{i + 1}</td>
              {m.fields.map((f) => (
                <td key={f.key} className={`${flash === `${r.id}:${f.key}` ? 'flash' : ''}${f.type === 'url' ? ' u' : ''}${f.mono ? ' mono' : ''}`}
                  onClick={f.type === 'url' ? undefined : (e) => onCopy(r, f, e.currentTarget)}>
                  {r[f.key] ? <div className="clamp"><Cell f={f} v={r[f.key]} onCopy={(el) => onCopy(r, f, el)} compact /></div> : null}
                </td>
              ))}
              <td className="act">
                <button className="ic" data-tip={t('edit')} onClick={() => onEdit(r)}><Icon name="edit" /></button>
                <button className="ic d" data-tip={t('delete')} onClick={() => onDel(r)}><Icon name="delete" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  const [flash, setFlash] = useState('')
  const fcount = Object.values(p.flt).filter(Boolean).length
  const hidden = HIDDEN.includes(m.key)
  const grid = p.view === 'grid'

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
    setFlash(`${r.id}:${f.key}`); setTimeout(() => setFlash(''), 1200); flashTip(el, t('copied'))
  }
  const edit = async (r) => {
    if (!r) return setForm({})
    const x = await revealRow(m, r)
    if (x) setForm({ row: x })
  }
  const onSort = (k) => setP({ sort: p.sort.f === k ? { f: k, d: -p.sort.d } : { f: k, d: 1 } })
  const sorts = [{ v: 'createdAt', l: t('newest') }, ...m.fields.filter((f) => f.type !== 'password').map((f) => ({ v: f.key, l: fl(f.label) }))]
  const setFlt = (k) => (v) => setP({ flt: { ...p.flt, [k]: v } })
  const shown = rows.slice(0, lim)

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
            {[['grid', 'grid_view', 'view_grid'], ['table', 'table', 'view_list']].map(([v, i, k]) =>
              <button key={v} data-tip={t(k)} className={(grid ? 'grid' : 'table') === v ? 'on' : ''} onClick={() => setP({ view: v })}><Icon name={i} /></button>)}
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

      {!ready[m.key] ? <div className="recs">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="rec sk" />)}</div>
        : !rows.length ? (
          <div className="card empty"><Icon name={m.icon} size={44} />
            <b>{q || fcount ? t('no_match') : t('no_rec')}</b>
            <span>{q || fcount ? t('try_other') : t('add_hint')}</span></div>
        ) : (
          <>
            {grid
              ? <div className="recs grid">{shown.map((r, i) => <Rec key={r.id} m={m} r={r} i={i} fl={flash} onEdit={edit} onDel={setDel} onCopy={copy} />)}</div>
              : <DataTable m={m} rows={shown} sort={p.sort} onSort={onSort} fl={flash} onEdit={edit} onDel={setDel} onCopy={copy} />}
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
