import { useEffect, useRef, useState } from 'react';
import { notify } from '../utils/notify';
import { copyText } from '../utils/clipboard';
import { normalizeUrl } from '../utils/validators';
import { useT } from '../i18n';
import Icon from './ui/Icon';
import IconButton from './ui/IconButton';
import { Stars } from './ui/RatingInput';
import { ItemActions } from './ui/SwipeableItem';
import CafeThumb from './CafeThumb';

/** Copy button that flips to a check mark for a moment so the result is visible right on the card. */
function CopyMapButton({ url }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    if (await copyText(normalizeUrl(url))) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } else {
      notify.error(t('cafe.mapCopyError'));
    }
  }

  return (
    <>
      <IconButton
        icon={copied ? 'check' : 'content_copy'}
        label={copied ? t('cafe.mapCopied') : t('cafe.copyMap')}
        variant={copied ? 'filled' : 'outlined'}
        size={20}
        onClick={copy}
        className="transition-colors duration-200"
      />
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? t('cafe.mapCopied') : ''}
      </span>
    </>
  );
}

/**
 * Cafe shop card: photo + name / rating / visits on top, address and note below,
 * and one action bar at the bottom (open map, copy link, reorder) so the text keeps the full card width.
 */
export default function CafeShopCard({ shop, visits, canMove, isFirst, isLast, busy, onMove, onEdit, onDelete }) {
  const t = useT();
  const hasMap = !!shop.mapUrl;

  function openMap() {
    window.open(normalizeUrl(shop.mapUrl), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="rounded-3xl bg-surface-container-low p-4 transition-colors duration-200 hover:bg-surface-container">
      <div className="flex items-start gap-3.5">
        <CafeThumb src={shop.imageUrl} icon="storefront" size={72} zoomable title={shop.name} className="!rounded-[20px]" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="wrap-any min-w-0 flex-1 text-title-md text-on-surface">{shop.name}</p>
            <ItemActions onEdit={onEdit} onDelete={onDelete} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {shop.rating > 0 && <Stars value={shop.rating} size={16} />}
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-md text-on-surface-variant">
              <Icon name="local_cafe" size={14} />
              {t('cafe.visits', { n: visits })}
            </span>
          </div>
        </div>
      </div>

      {(shop.address || shop.description) && (
        <div className="mt-3 space-y-1.5">
          {shop.address && (
            <p className="wrap-any flex items-start gap-2 text-body-md text-on-surface">
              <Icon name="location_on" size={18} className="mt-0.5 text-primary" />
              <span className="min-w-0 flex-1">{shop.address}</span>
            </p>
          )}
          {shop.description && <p className="wrap-any line-clamp-2 text-body-sm text-on-surface-variant">{shop.description}</p>}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-outline-variant/60 pt-3">
        {hasMap ? (
          <>
            <button
              type="button"
              onClick={openMap}
              aria-label={t('cafe.openMapAria')}
              title={t('cafe.openMapAria')}
              className="state-layer morph inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-secondary-container px-4 text-label-lg text-on-secondary-container"
            >
              <Icon name="map" size={18} />
              <span className="truncate">{t('cafe.openMap')}</span>
              <Icon name="open_in_new" size={14} className="opacity-70" />
            </button>
            <CopyMapButton url={shop.mapUrl} />
          </>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="state-layer inline-flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full px-3 text-label-lg text-primary"
          >
            <Icon name="add" size={18} />
            <span className="truncate">{t('cafe.addMap')}</span>
          </button>
        )}

        {canMove && (
          <>
            <span className="mx-0.5 h-6 w-px shrink-0 bg-outline-variant" aria-hidden="true" />
            <IconButton icon="expand_less" label={t('cafe.moveUp')} size={22} disabled={busy || isFirst} onClick={() => onMove(-1)} className="!h-9 !w-9" />
            <IconButton icon="expand_more" label={t('cafe.moveDown')} size={22} disabled={busy || isLast} onClick={() => onMove(1)} className="!h-9 !w-9" />
          </>
        )}
      </div>
    </div>
  );
}
