import { useEffect, useMemo, useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Info, X } from 'lucide-react';
import { useSettings } from '../lib/settings';
import { buildFile, download, previewText, toRows } from '../lib/export';
import { Modal } from './Overlay';
import { Button, Segmented } from './ui';

export default function ExportDialog({ open, onClose, all, filtered, favSet, filtersActive, onToast }) {
  const { t } = useSettings();
  const [format, setFormat] = useState('json');
  const [scope, setScope] = useState('all');

  useEffect(() => { if (open) setScope(filtersActive ? 'filtered' : 'all'); }, [open, filtersActive]);

  const list = useMemo(() => (scope === 'fav' ? all.filter((c) => favSet.has(c.id)) : scope === 'filtered' ? filtered : all), [scope, all, filtered, favSet]);
  const rows = useMemo(() => toRows(list, favSet), [list, favSet]);
  const preview = useMemo(() => previewText(format, rows), [format, rows]);
  const favCount = all.filter((c) => favSet.has(c.id)).length;

  const run = () => {
    if (!rows.length) return;
    const { content, mime, ext } = buildFile(format, rows);
    const file = `umamusume-roster-${new Date().toISOString().slice(0, 10)}.${ext}`;
    download(file, mime, content);
    onToast({ variant: 'success', message: t('exported', { n: rows.length, file }) });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={Download}
      title={t('exportTitle')}
      footer={
        <>
          <Button variant="neutral" icon={X} onClick={onClose}>{t('cancel')}</Button>
          <Button variant="success" icon={Download} onClick={run} disabled={!rows.length}>{t('download')}</Button>
        </>
      }
    >
      <p className="mb-2 text-sm font-bold">{t('exportFormat')}</p>
      <Segmented label={t('exportFormat')} value={format} onChange={setFormat} options={[{ value: 'json', label: 'JSON', icon: FileJson }, { value: 'csv', label: 'CSV', icon: FileSpreadsheet }]} />

      <p className="mb-2 mt-5 text-sm font-bold">{t('exportScope')}</p>
      <Segmented
        label={t('exportScope')}
        value={scope}
        onChange={setScope}
        options={[
          { value: 'all', label: `${t('scopeAll')} ${all.length}` },
          { value: 'filtered', label: `${t('scopeFiltered')} ${filtered.length}`, disabled: !filtersActive },
          { value: 'fav', label: `${t('scopeFav')} ${favCount}`, disabled: !favCount }
        ]}
      />
      <p className="mt-3 text-sm font-semibold text-accent" aria-live="polite">{rows.length ? t('exportCount', { n: rows.length }) : t('exportEmpty')}</p>

      <p className="mb-2 mt-5 text-sm font-bold">{t('exportPreview')}</p>
      <pre className="max-h-48 overflow-auto rounded-xl border border-line bg-surface-2 p-3 text-xs leading-relaxed" tabIndex={0}>{preview || '—'}</pre>
      {format === 'csv' && <p className="mt-3 flex items-start gap-2 text-xs text-ink-2"><Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />{t('csvNote')}</p>}
    </Modal>
  );
}
