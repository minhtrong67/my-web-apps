import { useMemo, useRef, useState } from 'react'
import { Icon, Modal, hue } from '../components/ui'
import RecordDialog from '../components/RecordDialog'
import { useData } from '../data'

const mask = '••••••••'

function Cell({ f, v }) {
  if (!v) return null
  if (f.type === 'password') return <span>{mask}</span>
  if (f.type === 'url') return <a href={v} target="_blank" rel="noopener noreferrer">{String(v).replace(/^https?:\/\/(www\.)?/, '').slice(0, 48)}</a>
  if (f.type === 'select' || f.type === 'reference') return <span className="chip">{v}</span>
  return v
}

export default function ResourcePage({ m }) {
  const { data, ready, remove, bulk, toast } = useData()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState({ f: 'createdAt', d: -1 })
  const [lim, setLim] = useState(50)
  const [form, setForm] = useState(null) // { row? }
  const [imp, setImp] = useState(null)
  const [menu, setMenu] = useState(false)
  const file = useRef()
  const all = data[m.key]

  const rows = useMemo(() => {
    const k = q.trim().toLowerCase()
    return (all || [])
      .filter((r) => !k || m.fields.some((f) => f.type !== 'password' && String(r[f.key] ?? '').toLowerCase().includes(k)))
      .sort((a, b) => {
        const x = a[sort.f] ?? '', y = b[sort.f] ?? ''
        return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'vi', { numeric: true })) * sort.d
      })
  }, [all, q, sort, m])

  const copy = (row, f) => row[f.key] && navigator.clipboard.writeText(row[f.key]).then(() => toast('Đã sao chép'))

  const exportAs = async (type) => {
    setMenu(false)
    const x = await import('../utils/importExport')
    const name = `${m.key}_${new Date().toISOString().slice(0, 10)}`
    if (type === 'csv') x.exportToCSV(rows, m.fields, name)
    else if (type === 'xlsx') x.exportToExcel(rows, m.fields, name)
    else x.exportToPDF(rows, m.fields, name, m.pluralLabel, m.color)
  }

  const onFile = async (e) => {
    const f = e.target.files[0]; e.target.value = ''
    if (!f) return
    try {
      const x = await import('../utils/importExport')
      setImp(x.normalizeImportedRows(await x.parseImportFile(f), m.fields))
    } catch (err) { toast(err.message) }
  }

  const doImport = async () => {
    try { await bulk(m, imp.valid); toast(`Đã nhập ${imp.valid.length} bản ghi`); setImp(null) } catch (e) { toast('Lỗi: ' + e.message) }
  }

  const arrow = (f) => sort.f === f && <Icon name={sort.d > 0 ? 'arrow_upward' : 'arrow_downward'} />

  return (
    <div className="page">
      <header className="head">
        <h1 className="h1 s">{m.label}</h1>
        <label className="search"><Icon name="search" />
          <input type="search" placeholder="Tìm trong danh sách" value={q} onChange={(e) => { setQ(e.target.value); setLim(50) }} /></label>
        <span className="relative flex flex-wrap gap-2">
          <button className="b" onClick={() => file.current.click()}><Icon name="upload_file" />Nhập CSV</button>
          <button className="b" onClick={() => setMenu(!menu)}><Icon name="download" />Xuất</button>
          {menu && (
            <div className="menu" style={{ left: 'auto', right: 0 }}>
              {[['csv', 'CSV', 'csv'], ['xlsx', 'Excel (.xlsx)', 'table_view'], ['pdf', 'PDF', 'picture_as_pdf']].map(([t, l, i]) =>
                <button key={t} onClick={() => exportAs(t)}><Icon name={i} />{l}</button>)}
            </div>
          )}
        </span>
        <input ref={file} type="file" accept=".csv,text/csv" hidden onChange={onFile} />
      </header>

      {!ready[m.key] ? <div className="card empty">Đang tải…</div>
        : !rows.length ? (
          <div className="card empty"><span className="ms" style={{ fontSize: 48 }}>{m.icon}</span>
            <b>{q ? 'Không có kết quả khớp' : 'Chưa có bản ghi nào'}</b>
            <span>{q ? 'Thử từ khoá khác.' : 'Thêm mới hoặc nhập từ file CSV.'}</span></div>
        ) : (
          <div className="card">
            <table className="w-full">
              <thead><tr>
                {m.fields.map((f) => <th key={f.key} onClick={() => setSort(sort.f === f.key ? { f: f.key, d: -sort.d } : { f: f.key, d: 1 })}>{f.label} {arrow(f.key)}</th>)}
                <th />
              </tr></thead>
              <tbody>
                {rows.slice(0, lim).map((r) => (
                  <tr key={r.id}>
                    {m.fields.map((f) => (
                      <td key={f.key} data-l={f.label} data-id={r.id} className={f.mono ? 'm' : ''} onClick={(e) => !e.target.closest('a') && copy(r, f)}>
                        <Cell f={f} v={r[f.key]} />
                      </td>
                    ))}
                    <td className="ac">
                      <button className="ic" title="Sửa" onClick={() => setForm({ row: r })}><Icon name="edit" /></button>
                      <button className="ic d" title="Xoá" onClick={() => remove(m, r)}><Icon name="delete" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="foot"><span>{rows.length} bản ghi{q ? ' khớp' : ''} · bấm vào ô để sao chép</span>
              {rows.length > lim && <button className="b" onClick={() => setLim(lim + 50)}>Hiện thêm</button>}</div>
          </div>
        )}

      <button className="fab" onClick={() => setForm({})}><Icon name="add" />Thêm mới</button>

      {form && <RecordDialog m={m} row={form.row} onClose={() => setForm(null)} />}
      {imp && (
        <Modal onClose={() => setImp(null)} style={hue(m.key)}>
          <h2>Nhập vào {m.label}</h2>
          <p><b>{imp.valid.length}</b> dòng hợp lệ{imp.invalid.length ? <>, <b>{imp.invalid.length}</b> dòng thiếu trường bắt buộc sẽ bị bỏ qua</> : ''}. Cột cần có: {m.fields.map((f) => f.key).join(', ')}.</p>
          <div className="btns">
            <button className="b t" onClick={() => setImp(null)}>Huỷ</button>
            <button className="b f" disabled={!imp.valid.length} onClick={doImport}>Nhập {imp.valid.length} dòng</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
