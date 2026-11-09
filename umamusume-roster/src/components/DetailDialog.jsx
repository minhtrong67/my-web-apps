import { useEffect } from 'react';
import { Cake, Check, ChevronLeft, ChevronRight, Copy, ExternalLink, GraduationCap, Footprints, Globe, Heart, House, Info, Link2, Mic, Ruler, Search, Shirt, Sparkles, UserRound, X } from 'lucide-react';
import { GROUPS, OFFICIAL_URL, ZODIAC_VI, daysUntil, fandomUrl, formatBirthday, gametoraUrl, hasGametora, wikiUrl, zodiac } from '../data/characters';
import { useSettings } from '../lib/settings';
import { Modal } from './Overlay';
import { Button, GroupBadge, IconButton } from './ui';
import Avatar from './Avatar';

const link = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95';

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-ink-2">{label}</dt>
        <dd className="break-words text-sm font-bold">{children}</dd>
      </div>
    </div>
  );
}

export default function DetailDialog({ c, list, fav, copied, onClose, onNav, onCopy, onCopyLink, onFav }) {
  const { t, settings } = useSettings();
  const open = !!c;
  const index = c ? list.findIndex((x) => x.id === c.id) : -1;

  useEffect(() => {
    if (!open) return;
    const key = (e) => {
      if (e.key === 'ArrowLeft') onNav(-1);
      if (e.key === 'ArrowRight') onNav(1);
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [open, onNav]);

  if (!c) return <Modal open={false} onClose={onClose} title="" />;
  const color = GROUPS.find((g) => g.id === c.group)?.color;
  const d = c.d;
  const lang = settings.lang;
  let bd = null, sign = null;
  if (d?.birthday) {
    const n = daysUntil(d.birthday);
    bd = { text: formatBirthday(d.birthday, lang), left: n === 0 ? t('bToday') : n === 1 ? t('bTomorrow') : t('bIn', { n }) };
    const z = zodiac(d.birthday);
    sign = lang === 'vi' ? ZODIAC_VI[z] : z;
  }
  const [b, w, h] = d?.sizes ? d.sizes.split('-') : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={UserRound}
      title={t('details')}
      size="lg"
      footer={
        <>
          <div className="mr-auto flex items-center">
            <IconButton icon={ChevronLeft} label={t('prev')} onClick={() => onNav(-1)} disabled={index <= 0} className="disabled:opacity-30" />
            <IconButton icon={ChevronRight} label={t('next')} onClick={() => onNav(1)} disabled={index < 0 || index >= list.length - 1} className="disabled:opacity-30" />
            <IconButton icon={Link2} label={t('copyLink')} onClick={onCopyLink} />
          </div>
          <Button variant="neutral" icon={X} onClick={onClose}>{t('close')}</Button>
          <Button variant={fav ? 'danger' : 'rose'} icon={Heart} onClick={() => onFav(c.id)}>{fav ? t('unfavorite') : t('favorite')}</Button>
          <Button variant={copied ? 'success' : 'primary'} icon={copied ? Check : Copy} onClick={() => onCopy(c)}>{copied ? t('copiedLabel') : t('copyName')}</Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <Avatar c={c} size={400} className="stage size-40 shrink-0 rounded-3xl border border-line shadow-lg" textClass="text-5xl" />
        <div className="w-full min-w-0 text-center sm:text-left">
          <h3 className="break-words text-2xl font-black italic leading-tight">{c.name}</h3>
          {d?.jp && <p className="mt-1 text-sm font-semibold text-ink-2">{d.jp}</p>}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:justify-start">
            <GroupBadge color={color}>{t(`g_${c.group}`)}</GroupBadge>
            <span className="text-xs font-bold italic tabular-nums text-ink-2">No.{String(c.no).padStart(3, '0')}</span>
            <span className="text-xs font-semibold text-ink-2">{t('infoPrefix')}: {c.prefix}</span>
          </div>
        </div>
      </div>

      <h4 className="mb-2 mt-6 text-sm font-extrabold">{t('profile')}</h4>
      {d ? (
        <dl className="grid gap-2 sm:grid-cols-2">
          {d.cv && <Row icon={Mic} label={t('voice')}>{d.cv}</Row>}
          {bd && <Row icon={Cake} label={t('birthday')}>{bd.text} <span className="font-semibold text-accent">· {bd.left}</span></Row>}
          {sign && <Row icon={Sparkles} label={t('zodiac')}>{sign}</Row>}
          {d.height && <Row icon={Ruler} label={t('height')}>{d.height} cm</Row>}
          {d.sizes && <Row icon={Shirt} label={t('sizes')}>{t('sizesFmt', { b, w, h })}</Row>}
          {d.shoe && <Row icon={Footprints} label={t('shoe')}>{d.shoe}</Row>}
          {d.school && <Row icon={GraduationCap} label={t('school')}>{t(`school_${d.school}`)}</Row>}
          {d.dorm && <Row icon={House} label={t('dorm')}>{t(`dorm_${d.dorm}`)}</Row>}
        </dl>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-line p-4">
          <Info className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-sm font-bold">{t('noProfile')}</p>
            <p className="mt-1 text-sm text-ink-2">{t('noProfileHint')}</p>
          </div>
        </div>
      )}
      {d && <p className="mt-2 text-xs text-ink-2">{t('source')}</p>}

      <div className="mt-6">
        <p className="mb-2 text-sm font-extrabold">{t('infoLinks')}</p>
        <div className="flex flex-wrap gap-2">
          <a className={`${link} bg-sky-600 text-white hover:bg-sky-700`} href={wikiUrl(c)} target="_blank" rel="noreferrer"><ExternalLink className="size-4" />{t('openWiki')}</a>
          {hasGametora(c) && <a className={`${link} bg-violet-600 text-white hover:bg-violet-700`} href={gametoraUrl(c)} target="_blank" rel="noreferrer"><ExternalLink className="size-4" />{t('gametora')}</a>}
          <a className={`${link} bg-emerald-600 text-white hover:bg-emerald-700`} href={fandomUrl(c)} target="_blank" rel="noreferrer"><Search className="size-4" />{t('openFandom')}</a>
          <a className={`${link} bg-surface-3 hover:brightness-95`} href={OFFICIAL_URL} target="_blank" rel="noreferrer"><Globe className="size-4" />{t('officialSite')}</a>
        </div>
      </div>
    </Modal>
  );
}
