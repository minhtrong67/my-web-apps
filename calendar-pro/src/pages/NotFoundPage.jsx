import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Button from '../components/Button'
import { useTranslation } from '../i18n/useTranslation'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="fx-float shape-flower mb-6 flex h-28 w-28 items-center justify-center bg-tertiary-container text-on-tertiary-container">
        <Icon name="explore_off" size={48} filled />
      </div>
      <h1 className="text-headline-md text-on-surface">{t('notFound.title')}</h1>
      <p className="mt-2 max-w-xs text-body-lg text-on-surface-variant">{t('notFound.desc')}</p>
      <Link to="/" className="mt-8">
        <Button size="lg">{t('notFound.backHome')}</Button>
      </Link>
    </div>
  )
}
