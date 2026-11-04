import { useState } from 'react'
import { Modal, Icon } from './ui'
import { useData } from '../data'
import { useT } from '../i18n'

export default function VaultDialog() {
  const { vd, unlockWith, cancelVault } = useData()
  const t = useT()
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  if (!vd) return null
  const create = vd.mode === 'create'

  const submit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.target), p = f.get('p')
    if (create && p.length < 8) return setErr(t('v_min'))
    if (create && p !== f.get('p2')) return setErr(t('v_mismatch'))
    setBusy(true); setErr('')
    const r = await unlockWith(p)
    setBusy(false)
    if (r) setErr(r)
  }

  return (
    <Modal onClose={cancelVault}>
      <form onSubmit={submit}>
        <h2><Icon name="lock" size={26} />{t(create ? 'v_create_t' : 'v_unlock_t')}</h2>
        <p>{t(create ? 'v_create_x' : 'v_unlock_x')}</p>
        <label className="fld"><span>{t('v_pass')}</span><input name="p" type="password" required autoFocus autoComplete="off" /></label>
        {create && <label className="fld"><span>{t('v_pass2')}</span><input name="p2" type="password" required autoComplete="off" /></label>}
        {err && <p className="errt">{err}</p>}
        <div className="btns">
          <button type="button" className="b n" onClick={cancelVault}><Icon name="close" />{t('cancel')}</button>
          <button className="b p" disabled={busy}><Icon name="lock_open" />{t(create ? 'v_create_b' : 'v_unlock_b')}</button>
        </div>
      </form>
    </Modal>
  )
}
