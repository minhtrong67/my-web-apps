import { useState } from 'react'
import { Modal, Icon, hue } from './ui'
import { useData } from '../data'

export default function RecordDialog({ m, row, onClose }) {
  const { save, data } = useData()
  const [eye, setEye] = useState(false)
  const v = row || {}

  const submit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const values = Object.fromEntries(m.fields.map((f) => [f.key, String(fd.get(f.key) ?? '').trim()]))
    try { await save(m, values, row?.id); onClose() } catch { /* toast đã báo lỗi */ }
  }

  const input = (f) => {
    const val = v[f.key] ?? f.default ?? ''
    if (f.type === 'textarea') return <textarea name={f.key} rows={3} defaultValue={val} />
    if (f.type === 'select')
      return <select name={f.key} defaultValue={val}>{[...new Set([...f.options, val].filter(Boolean))].map((o) => <option key={o}>{o}</option>)}</select>
    if (f.type === 'reference')
      return <input name={f.key} defaultValue={val} list="refs" required={f.required} autoComplete="off" />
    if (f.type === 'password')
      return <div><input name={f.key} type={eye ? 'text' : 'password'} defaultValue={val} autoComplete="new-password" />
        <button type="button" className="ic" onClick={() => setEye(!eye)} title="Hiện/ẩn"><Icon name={eye ? 'visibility_off' : 'visibility'} /></button></div>
    return <input name={f.key} type={f.type === 'email' ? 'email' : 'text'} defaultValue={val} required={f.required} autoComplete="off" />
  }

  return (
    <Modal onClose={onClose} style={hue(m.key)}>
      <form onSubmit={submit}>
        <h2>{row ? 'Sửa' : 'Thêm'} {m.label}</h2>
        {m.fields.map((f) => <label key={f.key} className="fld"><span>{f.label}{f.required ? ' *' : ''}</span>{input(f)}</label>)}
        <datalist id="refs">{(data.danbooru_tag_categories || []).map((c) => <option key={c.id} value={c.category} />)}</datalist>
        <div className="btns">
          <button type="button" className="b t" onClick={onClose}>Huỷ</button>
          <button className="b f">Lưu</button>
        </div>
      </form>
    </Modal>
  )
}
