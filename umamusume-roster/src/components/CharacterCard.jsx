import { Cake, Check, Copy, Heart } from 'lucide-react';
import { GROUPS } from '../data/characters';
import { useSettings } from '../lib/settings';
import Avatar from './Avatar';
import { GroupBadge, Highlight, IconButton } from './ui';
import { formatBirthday } from '../data/characters';

const groupColor = (id) => GROUPS.find((g) => g.id === id)?.color;
const pad = (n) => String(n).padStart(3, '0');

function Actions({ c, fav, copied, onCopy, onFav }) {
  const { t } = useSettings();
  return (
    <div className="flex shrink-0 items-center">
      <IconButton icon={copied ? Check : Copy} label={copied ? t('copiedLabel') : t('copyName')} onClick={() => onCopy(c)} className={copied ? '!text-emerald-600 bg-emerald-500/15' : ''} iconClass={copied ? 'check-pop' : ''} />
      <IconButton
        icon={Heart}
        label={fav ? t('removeFav') : t('addFav')}
        active={fav}
        tone="text-rose-500 hover:bg-rose-500/15"
        iconClass={fav ? 'fill-current heart-pop' : ''}
        onClick={() => onFav(c.id)}
      />
    </div>
  );
}

export default function CharacterCard({ c, view, index, fav, copied, q, onOpen, onCopy, onFav }) {
  const { t, settings } = useSettings();
  const delay = { animationDelay: `${Math.min(index % 48, 18) * 28}ms` };
  const bday = c.d?.birthday ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2"><Cake className="size-3.5" aria-hidden />{formatBirthday(c.d.birthday, settings.lang)}</span> : null;
  const badge = <GroupBadge color={groupColor(c.group)}>{t(`g_${c.group}`)}</GroupBadge>;

  if (view === 'list') {
    return (
      <article className="card flex items-center gap-3 rounded-2xl border border-line bg-surface p-2 pr-2.5" style={delay}>
        <button type="button" onClick={() => onOpen(c.id)} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left">
          <Avatar c={c} size={160} className="stage size-14 shrink-0 rounded-xl sm:size-16" textClass="text-lg" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold"><Highlight text={c.name} q={q} /></span>
            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {badge}
              <span className="text-xs font-bold italic tabular-nums text-ink-2">No.{pad(c.no)}</span>
              {bday}
            </span>
          </span>
        </button>
        <Actions c={c} fav={fav} copied={copied} onCopy={onCopy} onFav={onFav} />
      </article>
    );
  }

  return (
    <article className="card flex flex-col rounded-2xl border border-line bg-surface" style={delay}>
      <button type="button" onClick={() => onOpen(c.id)} className="flex flex-1 flex-col rounded-t-2xl text-left">
        <Avatar c={c} size={320} className="stage aspect-square w-full" textClass="text-4xl" />
        <span className="flex flex-1 flex-col items-start gap-1.5 p-3">
          <span className="line-clamp-2 min-h-[2.5em] text-[0.95rem] font-bold leading-tight"><Highlight text={c.name} q={q} /></span>
          {badge}
          {bday}
        </span>
      </button>
      <div className="flex items-center justify-between border-t border-line py-1 pl-3 pr-1.5">
        <span className="text-xs font-bold italic tabular-nums text-ink-2">No.{pad(c.no)}</span>
        <Actions c={c} fav={fav} copied={copied} onCopy={onCopy} onFav={onFav} />
      </div>
    </article>
  );
}
