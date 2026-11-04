import { useState } from 'react'
import { Modal, Icon, hue } from './ui'
import Select from './Select'
import { useData } from '../data'
import { useT, fl } from '../i18n'

export default function RecordDialog({ m, row, onClose }) {
  const { save, data } = useData()
  const t = useT()
  const [eye, setEye] = useState(false)
  const [busy, setBusy] = useState(false)
  const [vals, setVals] = useState(() => Object.fromEntries(m.fields.map((f) => [f.key, row?.[f.key] ?? f.default ?? ''])))
  const set = (k) => (v) => setVals((o) => ({ ...o, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try { await save(m, Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, String(v ?? '').trim()])), row?.id); onClose() }
    catch { setBusy(false) } // toast đã báo lỗi
  }

  const input = (f) => {
    const v = vals[f.key]
    if (f.type === 'textarea') return <textarea rows={3} value={v} onChange={(e) => set(f.key)(e.target.value)} />
    if (f.type === 'select') return <Select value={v} onChange={set(f.key)} options={[...new Set([...f.options, v].filter(Boolean))]} />
    if (f.type === 'reference')
      return <Select free required={f.required} value={v} onChange={set(f.key)} options={[...new Set((data.danbooru_tag_categories || []).map((c) => c.category))]} />
    if (f.type === 'password')
      return <div><input type={eye ? 'text' : 'password'} value={v} onChange={(e) => set(f.key)(e.target.value)} autoComplete="new-password" />
        <button type="button" className="ic" data-tip={t('pw_toggle')} onClick={() => setEye(!eye)}><Icon name={eye ? 'visibility_off' : 'visibility'} /></button></div>
    return <input type={f.type === 'email' ? 'email' : 'text'} value={v} required={f.required} autoComplete="off" onChange={(e) => set(f.key)(e.target.value)} />
  }

  return (
    <Modal onClose={onClose} style={hue(m.key)}>
      <form onSubmit={submit}>
        <h2><Icon name={row ? 'edit' : 'add'} size={26} />{t(row ? 'edit_x' : 'add_x', { x: m.label })}</h2>
        {m.fields.map((f) => <label key={f.key} className="fld"><span>{fl(f.label)}{f.required ? ' *' : ''}</span>{input(f)}</label>)}
        <div className="btns">
          <button type="button" className="b n" onClick={onClose}><Icon name="close" />{t('cancel')}</button>
          <button className="b p" disabled={busy}><Icon name="check" />{t('save')}</button>
        </div>
      </form>
    </Modal>
  )
}
