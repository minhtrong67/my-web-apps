import { useMemo, useState } from 'react';
import Fab from '../components/ui/Fab';
import SegmentedButton from '../components/ui/SegmentedButton';
import CafeTransactionList from '../components/CafeTransactionList';
import CafeStatsView from '../components/CafeStatsView';
import TransactionFormModal from '../components/TransactionFormModal';
import { useData } from '../contexts/DataContext';
import { useI18n } from '../i18n';
import { useSessionState } from '../hooks/useSessionState';
import { isCafeCategory } from '../utils/cafe';

/**
 * Cafe transactions: every expense in the cafe category, joined with its shop / drink / photo
 * (cafeLogs). Has its own filters and statistics, independent of the main Transactions page.
 */
export default function CafeTransactionsPage() {
  const { t } = useI18n();
  const { transactions, categories, getWallet, cafeLogById, cafeShopById, cafeDrinkById, loading, cafeLoading } = useData();
  const [tab, setTab] = useSessionState('cafe.tab', 'list');
  const [addOpen, setAddOpen] = useState(false);

  const cafeCategories = useMemo(() => categories.filter((c) => c.type === 'expense' && isCafeCategory(c)), [categories]);
  const cafeCategoryIds = useMemo(() => new Set(cafeCategories.map((c) => c.id)), [cafeCategories]);

  const items = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'expense' && cafeCategoryIds.has(tx.categoryId))
        .map((tx) => {
          const log = cafeLogById.get(tx.id);
          return { tx, log, shop: cafeShopById.get(log?.shopId), drink: cafeDrinkById.get(log?.drinkId), wallet: getWallet(tx.walletId) };
        }),
    [transactions, cafeCategoryIds, cafeLogById, cafeShopById, cafeDrinkById, getWallet],
  );

  const isLoading = loading || cafeLoading;
  const cafeCategoryId = cafeCategories[0]?.id || '';

  return (
    <div className="space-y-4 sm:space-y-5">
      <SegmentedButton
        className="sm:max-w-xs"
        ariaLabel={t('tx.view')}
        value={tab}
        onChange={setTab}
        options={[
          { id: 'list', label: t('cafe.tabTransactions'), icon: 'receipt_long' },
          { id: 'stats', label: t('cafe.tabStats'), icon: 'bar_chart' },
        ]}
      />

      {tab === 'stats' ? (
        <CafeStatsView items={items} loading={isLoading} />
      ) : (
        <CafeTransactionList items={items} loading={isLoading} cafeCategoryId={cafeCategoryId} onAdd={() => setAddOpen(true)} />
      )}

      {cafeCategoryId && <Fab label={t('cafe.addTx')} onClick={() => setAddOpen(true)} />}
      <TransactionFormModal open={addOpen} onClose={() => setAddOpen(false)} initialType="expense" initialCategoryId={cafeCategoryId} />
    </div>
  );
}
