import { useRef, useState } from 'react'
import { MODULES } from '../config/modules'
import { Icon, Modal, hue } from './ui'
import { useData } from '../data'
import { useT } from '../i18n'

// Nhập / xuất dữ liệu cho từng mục (nằm trong Cài đặt)
export default function DataTools() {
  const { data, plan, upsert, revealRow, toast } = useData()
  const t = useT()
  const [imp, setImp] = useState(null)
  const [mode, setMode] = useState('skip')
  const [busy, setBusy] = useState(false)
  const file = useRef(), target = useRef()

  const onFile = async (e) => {
    const f = e.target.files[0]; e.target.value = ''
    const m = target.current
    if (!f || !m) return
    try {
      const x = await import('../utils/importExport')
      const { valid, invalid } = x.normalizeImportedRows(await x.parseImportFile(f), m.fields)
      setMode('skip'); setImp({ m, valid, invalid, ...plan(m, valid) })
    } catch (err) { toast(err.message, 'error') }
  }
  const doImport = async () => {
    setBusy(true)
    try {
      const r = await upsert(imp.m, imp.valid, mode)
      toast(t('import_done', { a: r.added, u: r.updated, s: r.skipped }), 'success'); setImp(null)
    } catch (e) { toast(t('error') + e.message, 'error') }
    setBusy(false)
  }
  const exportAs = async (m, type) => {
    let rows = [...(data[m.key] || [])].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    if (type === 'csv' && m.fields.some((f) => f.type === 'password')) {
      const out = []
      for (const r of rows) { const x = await revealRow(m, r); if (!x) return; out.push(x) }
      rows = out; toast(t('csv_warn'), 'warning')
    }
    const x = await import('../utils/importExport')
    const name = `${m.key}_${new Date().toISOString().slice(0, 10)}`
    if (type === 'csv') x.exportToCSV(rows, m.fields, name)
    else if (type === 'xlsx') x.exportToExcel(rows, m.fields, name)
    else x.exportToPDF(rows, m.fields, name, m.pluralLabel, m.color)
  }

  return (
    <>
      <input ref={file} type="file" accept=".csv,text/csv" hidden onChange={onFile} />
      {MODULES.map((m) => {
        const n = data[m.key]?.length || 0
        return (
          <div key={m.key} className="drow" style={hue(m.key)}>
            <span className="dic"><Icon name={m.icon} /></span>
            <div className="dn"><b>{m.label}</b><small>{t('count', { n })}</small></div>
            <div className="dbtns">
              <button className="b s p" onClick={() => { target.current = m; file.current.click() }}><Icon name="upload_file" size={16} />{t('import_csv')}</button>
              {[['csv', 'CSV', 'csv'], ['xlsx', 'Excel', 'table_view'], ['pdf', 'PDF', 'picture_as_pdf']].map(([k, l, i]) =>
                <button key={k} className="b s" disabled={!n} onClick={() => exportAs(m, k)}><Icon name={i} size={16} />{l}</button>)}
            </div>
          </div>
        )
      })}
      {imp && (
        <Modal onClose={() => setImp(null)} style={hue(imp.m.key)}>
          <h2><Icon name="upload_file" size={26} />{t('imp_t', { x: imp.m.label })}</h2>
          <p><b>{t('imp_info', { n: imp.valid.length, f: imp.fresh, d: imp.dup })}</b>. {imp.invalid.length > 0 && t('imp_bad', { n: imp.invalid.length })} {t('imp_cols', { c: imp.m.fields.map((f) => f.key).join(', ') })}</p>
          {imp.dup > 0 && [['skip', 'opt_skip'], ['update', 'opt_update'], ['all', 'opt_all']].map(([v, l]) => (
            <label key={v} className="opt"><input type="radio" name="mode" checked={mode === v} onChange={() => setMode(v)} />{t(l)}</label>
          ))}
          {imp.m.fields.some((f) => f.type === 'password') && <p style={{ marginTop: 8 }}>{t('imp_pw')}</p>}
          <div className="btns">
            <button className="b n" onClick={() => setImp(null)}><Icon name="close" />{t('cancel')}</button>
            <button className="b p" disabled={!imp.valid.length || busy} onClick={doImport}><Icon name="upload_file" />{t('imp_btn', { n: imp.valid.length })}</button>
          </div>
        </Modal>
      )}
    </>
  )
}
