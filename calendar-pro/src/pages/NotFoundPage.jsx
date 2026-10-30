import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Button from '../components/Button'
import { useTranslation } from '../i18n/useTranslation'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-outline-variant text-ink-soft">
        <Icon name="explore_off" size={36} />
      </div>
      <h1 className="text-headline-sm text-ink">{t('notFound.title')}</h1>
      <p className="mt-2 max-w-xs text-body-md text-ink-soft">{t('notFound.desc')}</p>
      <Link to="/" className="mt-8">
        <Button size="lg">{t('notFound.backHome')}</Button>
      </Link>
    </div>
  )
}
