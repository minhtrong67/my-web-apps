import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon'
import Button from '../components/Button'
import SelectField from '../components/SelectField'
import VanNienDetail from '../components/VanNienDetail'
import { Page, PageHeader } from '../components/Page'
import { useToast } from '../contexts/ToastContext'
import { lunarToSolar } from '../lib/lunar'
import { pad2 } from '../lib/dateUtils'
import { useTranslation } from '../i18n/useTranslation'

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS = Array.from({ length: 61 }, (_, i) => 2000 + i)

export default function VanNienPage() {
  const { t } = useTranslation()
  const today = useMemo(() => new Date(), [])
  const [mode, setMode] = useState('solar') // 'solar' | 'lunar'
  const [solar, setSolar] = useState({ d: today.getDate(), m: today.getMonth() + 1, y: today.getFullYear() })
  const [lunar, setLunar] = useState({ d: 1, m: 1, y: today.getFullYear() })
  const [resultDate, setResultDate] = useState(today)
  const resultRef = useRef(null)
  const { notify } = useToast()

  useEffect(() => {
    setResultDate(today)
  }, [today])

  // Tra cứu tức thì (không cần chờ giả lập); trên màn hình hẹp tự cuộn tới kết quả
  function handleLookup() {
    let found = null
    if (mode === 'solar') {
      const d = new Date(solar.y, solar.m - 1, solar.d)
      if (d.getMonth() !== solar.m - 1) {
        notify(t('vanNien.invalidSolar'), { type: 'error', title: t('vanNien.invalidTitle') })
        return
      }
      found = d
      notify(t('vanNien.convertedToLunar'), { type: 'success' })
    } else {
      const [sd, sm, sy] = lunarToSolar(lunar.d, lunar.m, lunar.y, 0)
      if (!sd) {
        notify(t('vanNien.invalidLunar'), { type: 'error', title: t('vanNien.invalidTitle') })
        return
      }
      found = new Date(sy, sm - 1, sd)
      notify(t('vanNien.convertedToSolar'), { type: 'success' })
    }
    setResultDate(found)
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  return (
    <Page wide>
      <PageHeader title={t('vanNien.title')} subtitle={t('vanNien.subtitle')} />

      {/* Màn hình rộng: biểu mẫu cố định bên trái, kết quả bên phải */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <section className="rounded-2xl border border-outline-variant bg-card shadow-soft lg:sticky lg:top-8">
          {/* Tab dạng gạch chân */}
          <div className="flex border-b border-outline-variant" role="tablist">
            <TabButton active={mode === 'solar'} onClick={() => setMode('solar')}>
              {t('vanNien.fromSolar')}
            </TabButton>
            <TabButton active={mode === 'lunar'} onClick={() => setMode('lunar')}>
              {t('vanNien.fromLunar')}
            </TabButton>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-3 pt-2">
              {mode === 'solar' ? (
                <>
                  <Select label={t('vanNien.day')} value={solar.d} onChange={(v) => setSolar((s) => ({ ...s, d: v }))} options={DAYS} isYear={false} />
                  <Select label={t('vanNien.month')} value={solar.m} onChange={(v) => setSolar((s) => ({ ...s, m: v }))} options={MONTHS} isYear={false} />
                  <Select label={t('vanNien.year')} value={solar.y} onChange={(v) => setSolar((s) => ({ ...s, y: v }))} options={YEARS} isYear />
                </>
              ) : (
                <>
                  <Select label={t('vanNien.day')} value={lunar.d} onChange={(v) => setLunar((s) => ({ ...s, d: v }))} options={DAYS} isYear={false} />
                  <Select label={t('vanNien.month')} value={lunar.m} onChange={(v) => setLunar((s) => ({ ...s, m: v }))} options={MONTHS} isYear={false} />
                  <Select label={t('vanNien.year')} value={lunar.y} onChange={(v) => setLunar((s) => ({ ...s, y: v }))} options={YEARS} isYear />
                </>
              )}
            </div>

            <Button
              size="lg"
              className="mt-5 w-full"
              icon={(p) => <Icon name={mode === 'solar' ? 'search' : 'swap_horiz'} {...p} />}
              onClick={handleLookup}
            >
              {t('vanNien.submit')}
            </Button>
          </div>
        </section>

        <section ref={resultRef} className="scroll-mt-16 lg:scroll-mt-8" aria-live="polite">
          <VanNienDetail date={resultDate} />
        </section>
      </div>
    </Page>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`state focus-ring relative flex h-12 flex-1 items-center justify-center text-label-lg first:rounded-tl-2xl last:rounded-tr-2xl ${
        active ? 'text-primary' : 'text-ink-soft'
      }`}
    >
      {children}
      {active && <span className="absolute inset-x-5 bottom-0 h-0.5 bg-primary" aria-hidden="true" />}
    </button>
  )
}

function Select({ label, value, onChange, options, isYear }) {
  return (
    <SelectField label={label} value={value} onChange={(e) => onChange(Number(e.target.value))} labelBg="bg-card">
      {options.map((o) => (
        <option key={o} value={o}>
          {isYear ? o : pad2(o)}
        </option>
      ))}
    </SelectField>
  )
}
