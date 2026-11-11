import { Keyboard, X } from 'lucide-react'
import { useI18n } from '../lib/i18n.jsx'
import { Btn, Modal } from './UI.jsx'

export const MOD = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'

export function Shortcuts({ open, onClose }) {
  const { t } = useI18n()
  const rows = [
    [[MOD, 'K'], t('scSearch')], [['/'], t('scSearch')], [['Esc'], t('scClear')],
    [['G'], t('scView')], [['S'], t('scSelect')], [['E'], t('scExport')], [[','], t('scSettings')], [['T'], t('scTheme')],
    [['←', '→'], t('scNav')], [['?'], t('scHelp')]
  ]
  return (
    <Modal open={open} onClose={onClose} title={t('shortcuts')} icon={Keyboard} size="sm" footer={<Btn tone="neutral" icon={X} onClick={onClose}>{t('close')}</Btn>}>
      <ul className="divide-y divide-line">
        {rows.map(([keys, label], i) => (
          <li key={i} className="flex items-center justify-between gap-4 py-2.5 text-sm">
            <span>{label}</span>
            <span className="flex shrink-0 items-center gap-1">{keys.map((k) => <kbd key={k} className="kbd">{k}</kbd>)}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
