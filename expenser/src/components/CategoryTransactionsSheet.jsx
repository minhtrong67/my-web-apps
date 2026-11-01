import { useMemo } from 'react';
import Modal from './ui/Modal';
import Emoji from './ui/Emoji';
import EmptyState from './ui/EmptyState';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../i18n';
import { formatMoney, formatTime, formatDayHeader, dayKey } from '../utils/format';
import { getCategoryEmoji } from '../utils/categoryEmoji';

/**
 * Read-only bottom sheet listing the expenses of one category in the selected period.
 * No edit / delete actions - it is only for looking things up.
 * `category`: { id, name, color, value, pct } or null (closed). `transactions`: already filtered to the period.
 */
export default function CategoryTransactionsSheet({ category, transactions, onClose }) {
  const { t } = useI18n();
  const { getCategory, getWallet } = useData();

  const items = useMemo(() => {
    if (!category) return [];
    return transactions
      .filter((tx) => tx.type === 'expense' && String(tx.categoryId) === category.id)
      .sort((a, b) => b.date - a.date);
  }, [category, transactions]);

  const groups = useMemo(() => {
    const map = new Map();
    items.forEach((tx) => {
      const key = dayKey(tx.date);
      if (!map.has(key)) map.set(key, { key, date: tx.date, total: 0, items: [] });
      const g = map.get(key);
      g.total += tx.amount;
      g.items.push(tx);
    });
    return [...map.values()];
  }, [items]);

  const cat = category ? getCategory(category.id) : null;
  const color = category?.color || '#64748B';

  return (
    <Modal open={!!category} onClose={onClose} variant="drawer" title={category?.name || ''}>
      {category && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-surface-container p-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${color}26`, color }}>
              <Emoji size={22}>{getCategoryEmoji(cat)}</Emoji>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-title-md font-bold tabular-nums text-expense">-{formatMoney(category.value)}</p>
              <p className="wrap-any text-body-sm text-on-surface-variant">{t('stats.catSummary', { n: items.length, pct: category.pct })}</p>
            </div>
          </div>

          {groups.length === 0 ? (
            <EmptyState icon="receipt_long" text={t('stats.catEmpty')} />
          ) : (
            groups.map((g) => (
              <section key={g.key}>
                <div className="mb-2 flex items-center justify-between gap-2 px-1">
                  <h3 className="text-label-lg uppercase tracking-wide text-on-surface-variant">{formatDayHeader(g.date)}</h3>
                  <span className="text-label-lg font-bold tabular-nums text-on-surface-variant">-{formatMoney(g.total)}</span>
                </div>
                <ul className="space-y-2">
                  {g.items.map((tx) => {
                    const wallet = getWallet(tx.walletId);
                    return (
                      <li key={tx.id} className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-3">
                        <div className="min-w-0 flex-1">
                          <p className="wrap-any text-title-sm text-on-surface">{tx.note || category.name}</p>
                          <p className="wrap-any text-body-sm text-on-surface-variant">
                            {formatTime(tx.date)}
                            {wallet?.name ? ` · ${wallet.name}` : ''}
                          </p>
                        </div>
                        <span className="shrink-0 text-title-sm font-bold tabular-nums text-expense">-{formatMoney(tx.amount)}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      )}
    </Modal>
  );
}
