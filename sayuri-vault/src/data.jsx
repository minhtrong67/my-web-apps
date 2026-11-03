import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { collection, onSnapshot, addDoc, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import { MODULES } from './config/modules'

const Ctx = createContext(null)
export const useData = () => useContext(Ctx)

export function DataProvider({ children }) {
  const [data, setData] = useState({})
  const [ready, setReady] = useState({})
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, label, fn) => {
    const id = Math.random()
    setToasts((t) => [...t, { id, msg, label, fn }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), label ? 7000 : 3500)
  }, [])
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id))

  useEffect(() => {
    const offs = MODULES.map((m) =>
      onSnapshot(
        collection(db, m.table),
        (s) => {
          setData((d) => ({ ...d, [m.key]: s.docs.map((x) => ({ id: x.id, ...x.data() })) }))
          setReady((r) => ({ ...r, [m.key]: true }))
        },
        (err) => {
          setReady((r) => ({ ...r, [m.key]: true }))
          toast('Firestore: ' + err.message)
        },
      ),
    )
    return () => offs.forEach((f) => f())
  }, [toast])

  const run = async (fn, ok) => {
    try { await fn(); if (ok) toast(ok) } catch (e) { toast('Lỗi: ' + e.message); throw e }
  }

  const save = (m, values, id) => {
    const now = Date.now()
    return run(
      () => (id ? setDoc(doc(db, m.table, id), { ...values, updatedAt: now }, { merge: true }) : addDoc(collection(db, m.table), { ...values, createdAt: now, updatedAt: now })),
      id ? 'Đã lưu thay đổi' : 'Đã thêm bản ghi',
    )
  }

  const remove = (m, row) => {
    const { id, ...rest } = row
    return run(() => deleteDoc(doc(db, m.table, id))).then(() =>
      toast('Đã xoá bản ghi', 'Hoàn tác', () => setDoc(doc(db, m.table, id), rest)))
  }

  const bulk = async (m, rows) => {
    const base = Date.now()
    for (let i = 0; i < rows.length; i += 400) {
      const b = writeBatch(db)
      rows.slice(i, i + 400).forEach((r, j) =>
        b.set(doc(collection(db, m.table)), { ...r, createdAt: base + rows.length - i - j, updatedAt: base }))
      await b.commit()
    }
  }

  const seed = () => run(async () => {
    const s = (await import('./seed.json')).default
    let n = 0
    for (const m of MODULES) {
      if (data[m.key]?.length || !s[m.key]) continue
      await bulk(m, s[m.key]); n += s[m.key].length
    }
    toast(n ? `Đã nạp ${n} bản ghi vào Firestore` : 'Các bộ sưu tập đã có dữ liệu, không nạp thêm')
  })

  const all = MODULES.every((m) => ready[m.key])
  const total = MODULES.reduce((a, m) => a + (data[m.key]?.length || 0), 0)
  return <Ctx.Provider value={{ data, ready, all, total, toasts, dismiss, toast, save, remove, bulk, seed }}>{children}</Ctx.Provider>
}
