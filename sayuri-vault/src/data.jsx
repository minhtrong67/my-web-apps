import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { collection, onSnapshot, addDoc, setDoc, doc, getDoc, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import { MODULES, keyOf } from './config/modules'
import { b64, ub, isEnc, newSalt, deriveKey, encrypt, decrypt } from './crypto'
import { tr } from './i18n'

const Ctx = createContext(null)
export const useData = () => useContext(Ctx)
const pwKeys = (m) => m.fields.filter((f) => f.type === 'password').map((f) => f.key)
const chunks = (a, n = 400) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))
const CAT = 'danbooru_tag_categories'

export function DataProvider({ children }) {
  const [data, setData] = useState({})
  const [ready, setReady] = useState({})
  const [toasts, setToasts] = useState([])
  const [vd, setVd] = useState(null) // hộp thoại passphrase
  const keyRef = useRef(null)

  // type: info | success | warning | error. Chỉ dùng cho kết quả quan trọng.
  const toast = useCallback((msg, type = 'info', label, fn) => {
    const id = Math.random(), ms = type === 'error' ? 6500 : label ? 7000 : 4000
    setToasts((t) => [...t.slice(-2), { id, msg, type, label, fn, ms }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms)
  }, [])
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  useEffect(() => {
    const offs = MODULES.map((m) =>
      onSnapshot(collection(db, m.table),
        (s) => { setData((d) => ({ ...d, [m.key]: s.docs.map((x) => ({ id: x.id, ...x.data() })) })); setReady((r) => ({ ...r, [m.key]: true })) },
        (err) => { setReady((r) => ({ ...r, [m.key]: true })); toast('Firestore: ' + err.message, 'error') }))
    return () => offs.forEach((f) => f())
  }, [toast])

  const run = async (fn) => {
    try { return await fn() } catch (e) { toast(tr('error') + e.message, 'error'); throw e }
  }

  // ---- Két mật khẩu (passphrase → khoá AES, chỉ giữ trong bộ nhớ)
  const ensureKey = useCallback(() => keyRef.current ? Promise.resolve(keyRef.current) : new Promise((resolve) => {
    getDoc(doc(db, 'meta', 'vault'))
      .then((s) => setVd({ mode: s.exists() ? 'unlock' : 'create', meta: s.data(), resolve }))
      .catch((e) => { toast(tr('error') + e.message, 'error'); resolve(null) })
  }), [toast])

  const unlockWith = async (pass) => {
    const { mode, meta, resolve } = vd
    if (mode === 'create') {
      const salt = newSalt(), key = await deriveKey(pass, salt)
      await setDoc(doc(db, 'meta', 'vault'), { salt: b64(salt), check: await encrypt(key, 'sayuri-vault'), createdAt: Date.now() })
      keyRef.current = key; setVd(null); resolve(key); return null
    }
    try {
      const key = await deriveKey(pass, ub(meta.salt))
      if ((await decrypt(key, meta.check)) !== 'sayuri-vault') throw new Error()
      keyRef.current = key; setVd(null); resolve(key); return null
    } catch { return tr('v_wrong') }
  }
  const cancelVault = () => { vd?.resolve(null); setVd(null) }
  const lock = () => { keyRef.current = null; toast(tr('v_locked')) }

  const encRow = async (m, r) => {
    const ks = pwKeys(m).filter((k) => r[k] && !isEnc(r[k]))
    if (!ks.length) return r
    const key = await ensureKey()
    if (!key) throw new Error(tr('v_need'))
    const o = { ...r }
    for (const k of ks) o[k] = await encrypt(key, r[k])
    return o
  }
  const reveal = async (v) => {
    if (!isEnc(v)) return v
    const key = await ensureKey()
    if (!key) return null
    try { return await decrypt(key, v) } catch { toast(tr('v_fail'), 'error'); return null }
  }
  const revealRow = async (m, r) => {
    const o = { ...r }
    for (const k of pwKeys(m)) if (isEnc(r[k])) { const v = await reveal(r[k]); if (v == null) return null; o[k] = v }
    return o
  }

  // ---- Category: tự tạo category còn thiếu, đổi tên kéo theo tag, chặn xoá khi đang dùng
  const ensureCats = async (rows) => {
    const known = new Set((data[CAT] || []).map((c) => c.category.toLowerCase()))
    const miss = [...new Set(rows.map((r) => r.category).filter(Boolean))].filter((c) => !known.has(c.toLowerCase()))
    if (!miss.length) return
    const b = writeBatch(db), now = Date.now()
    miss.forEach((c, i) => b.set(doc(collection(db, CAT)), { category: c, status: 'Active', note: '', createdAt: now + i, updatedAt: now }))
    await b.commit()
  }
  const inUse = (m, rows) => {
    if (m.key !== CAT) return 0
    const s = new Set(rows.map((r) => r.category.toLowerCase()))
    return (data.danbooru_tags || []).filter((t) => s.has((t.category || '').toLowerCase())).length
  }

  const save = (m, values, id) => run(async () => {
    const now = Date.now(), v = await encRow(m, values)
    if (m.key === 'danbooru_tags') await ensureCats([v])
    if (!id) return addDoc(collection(db, m.table), { ...v, createdAt: now, updatedAt: now })
    if (m.key === CAT) {
      const old = data[CAT].find((x) => x.id === id)?.category
      if (old && old !== v.category) {
        const ts = (data.danbooru_tags || []).filter((t) => (t.category || '').toLowerCase() === old.toLowerCase())
        for (const c of chunks(ts)) { const b = writeBatch(db); c.forEach((t) => b.update(doc(db, 'danbooru_tags', t.id), { category: v.category })); await b.commit() }
      }
    }
    return setDoc(doc(db, m.table, id), { ...v, updatedAt: now }, { merge: true })
  })

  const removeMany = async (m, rows) => {
    const n = inUse(m, rows)
    if (n) { toast(tr('cat_in_use', { n }), 'warning'); return false }
    try {
      for (const c of chunks(rows)) { const b = writeBatch(db); c.forEach((r) => b.delete(doc(db, m.table, r.id))); await b.commit() }
      return true
    } catch (e) { toast(tr('error') + e.message, 'error'); return false }
  }

  // ---- Nhập hàng loạt có chống trùng. mode: skip | update | all
  const plan = (m, rows) => {
    const ex = new Set((data[m.key] || []).map((r) => keyOf(m, r))), seen = new Set()
    let fresh = 0, dup = 0
    rows.forEach((r) => { const k = keyOf(m, r); ex.has(k) || seen.has(k) ? dup++ : fresh++; seen.add(k) })
    return { fresh, dup }
  }
  const upsert = async (m, rows, mode = 'skip', opts = {}) => {
    const ex = new Map((data[m.key] || []).map((r) => [keyOf(m, r), r.id])), seen = new Set(), now = Date.now(), ops = []
    let added = 0, updated = 0, skipped = 0
    for (const r0 of rows) {
      const k = keyOf(m, r0), dupe = ex.has(k) || seen.has(k)
      seen.add(k)
      if (dupe && (mode === 'skip' || (mode === 'update' && !ex.has(k)))) { skipped++; continue }
      const r = await encRow(m, r0)
      if (dupe && mode === 'update') { ops.push(['u', ex.get(k), r]); updated++ } else { ops.push(['n', null, r]); added++ }
    }
    if (m.key === 'danbooru_tags' && !opts.noCats) await ensureCats(rows)
    for (const [i, c] of chunks(ops).entries()) {
      const b = writeBatch(db)
      c.forEach(([t, id, r], j) => t === 'u'
        ? b.set(doc(db, m.table, id), { ...r, updatedAt: now }, { merge: true })
        : b.set(doc(collection(db, m.table)), { ...r, createdAt: now + ops.length - i * 400 - j, updatedAt: now }))
      await b.commit()
    }
    return { added, updated, skipped }
  }

  const seed = () => run(async () => {
    const s = (await import('./seed.json')).default
    if (!data.accounts?.length && s.accounts?.length && !(await ensureKey())) return toast(tr('v_need_seed'), 'warning')
    let n = 0, catsDone = false
    for (const m of [...MODULES].sort((a, b) => (b.key === CAT) - (a.key === CAT))) {
      if (data[m.key]?.length || !s[m.key]) continue
      let rows = s[m.key]
      if (m.key === CAT) {
        const have = new Set(rows.map((r) => r.category.toLowerCase()))
        const extra = [...new Set((s.danbooru_tags || []).map((t) => t.category).filter(Boolean))].filter((c) => !have.has(c.toLowerCase()))
        rows = [...rows, ...extra.map((category) => ({ category, status: 'Active', note: '' }))]
        catsDone = true
      }
      n += (await upsert(m, rows, 'skip', { noCats: catsDone })).added
    }
    toast(n ? tr('seeded', { n }) : tr('seed_none'), n ? 'success' : 'info')
  })

  const migrate = () => run(async () => {
    const rows = (data.accounts || []).filter((r) => r.password && !isEnc(r.password))
    if (!rows.length) return toast(tr('mig_none'))
    const key = await ensureKey()
    if (!key) return
    for (const c of chunks(rows)) {
      const b = writeBatch(db)
      for (const r of c) b.set(doc(db, 'accounts', r.id), { password: await encrypt(key, r.password), updatedAt: Date.now() }, { merge: true })
      await b.commit()
    }
    toast(tr('mig_done', { n: rows.length }), 'success')
  })

  const all = MODULES.every((m) => ready[m.key])
  const total = MODULES.reduce((a, m) => a + (data[m.key]?.length || 0), 0)
  return <Ctx.Provider value={{ data, ready, all, total, toasts, dismiss, toast, save, removeMany, plan, upsert, seed, migrate, reveal, revealRow, lock, vd, unlockWith, cancelVault }}>{children}</Ctx.Provider>
}
