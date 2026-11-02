import { useEffect, useMemo, useState } from 'react';
import { notify } from '../utils/notify';
import Modal from './ui/Modal';
import Button from './ui/Button';
import MoneyInput from './ui/MoneyInput';
import TextInput from './ui/TextInput';
import Textarea from './ui/Textarea';
import ChoiceSelect from './ui/ChoiceSelect';
import SegmentedButton from './ui/SegmentedButton';
import Emoji from './ui/Emoji';
import Icon from './ui/Icon';
import ImageUpload from './ui/ImageUpload';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useT, useI18n } from '../i18n';
import { useRecentEntries } from '../hooks/useRecentEntries';
import { validateTransaction, trimValue } from '../utils/validators';
import { toInputDateTimeLocal, formatNumber } from '../utils/format';
import { getCategoryEmoji } from '../utils/categoryEmoji';
import { isCafeCategory } from '../utils/cafe';

function emptyForm() {
  return { type: 'expense', amount: '', categoryId: '', walletId: '', datetime: toInputDateTimeLocal(new Date()), note: '', shopId: '', drinkId: '', imageUrl: '' };
}

export default function TransactionFormModal({ open, onClose, editingTx, initialType = 'expense', initialCategoryId = '' }) {
  const t = useT();
  const { locale } = useI18n();
  const { categories, wallets, getCategory, addTransaction, updateTransaction, cafeShops, cafeDrinks, cafeLogById } = useData();
  const { user } = useAuth();
  const { forType, remember } = useRecentEntries(user?.uid);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingTx) {
      setForm({
        type: editingTx.type,
        amount: editingTx.amount,
        categoryId: editingTx.categoryId,
        walletId: editingTx.walletId,
        datetime: toInputDateTimeLocal(editingTx.date),
        note: editingTx.note || '',
        shopId: cafeLogById.get(editingTx.id)?.shopId || '',
        drinkId: cafeLogById.get(editingTx.id)?.drinkId || '',
        imageUrl: cafeLogById.get(editingTx.id)?.imageUrl || '',
      });
    } else {
      setForm({ ...emptyForm(), type: initialType, walletId: wallets[0]?.id || '', categoryId: initialCategoryId });
    }
    setErrors({});
    // Only re-initialise when the dialog opens / the edited item changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingTx]);

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((c) => c.type === form.type)
        .map((c) => ({ id: c.id, name: c.name, emoji: getCategoryEmoji(c), color: c.color }))
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    [categories, form.type, locale],
  );

  const walletOptions = useMemo(
    () => wallets.map((w) => ({ id: w.id, name: w.name, icon: w.icon, color: w.color })).sort((a, b) => a.name.localeCompare(b.name, locale)),
    [wallets, locale],
  );

  // Cafe mini-module: picking the cafe category reveals photo / shop / drink fields.
  const showCafe = form.type === 'expense' && isCafeCategory(getCategory(form.categoryId));

  // Optional dropdowns: once a value is picked, a "none" entry lets the user clear it again.
  const withNone = (list, value) => (value ? [{ id: '', name: t('cafe.none'), icon: 'remove', color: '#64748B' }, ...list] : list);
  const shopOptions = useMemo(
    () => cafeShops.map((s) => ({ id: s.id, name: s.name, icon: 'storefront', color: '#B45309' })),
    [cafeShops],
  );
  const drinkOptions = useMemo(
    () => cafeDrinks.map((d) => ({ id: d.id, name: d.name, icon: 'local_cafe', color: '#92400E' })),
    [cafeDrinks],
  );

  function setType(type) {
    setForm((f) => ({ ...f, type, categoryId: '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      note: trimValue(form.note),
      date: new Date(form.datetime),
      cafe: showCafe ? { shopId: form.shopId, drinkId: form.drinkId, imageUrl: form.imageUrl } : null,
    };
    const { valid, errors: errs } = validateTransaction(payload, t);
    setErrors(errs);
    if (!valid) return;
    setSaving(true);
    try {
      if (editingTx) {
        await updateTransaction(editingTx.id, payload, editingTx);
      } else {
        await addTransaction(payload);
        remember(payload);
      }
      onClose();
    } catch (err) {
      console.error(err);
      notify.error(t('tx.saveError'));
    } finally {
      setSaving(false);
    }
  }

  const recentForType = !editingTx ? forType(form.type) : [];

  // Quick-fill sets amount/category/wallet only - date & time always stay "now".
  function applyRecent(entry) {
    setForm((f) => ({ ...f, categoryId: entry.categoryId, walletId: entry.walletId, amount: entry.amount, datetime: toInputDateTimeLocal(new Date()) }));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingTx ? t('tx.editTitle') : t('tx.addTitle')}
      variant="sheet"
      footer={
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button type="button" variant="text" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="transaction-form" icon="check" loading={saving}>
            {editingTx ? t('common.save') : t('common.add')}
          </Button>
        </div>
      }
    >
      <form id="transaction-form" onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2" noValidate>
        <SegmentedButton
          ariaLabel={t('tx.type')}
          value={form.type}
          onChange={setType}
          options={[
            { id: 'expense', label: t('tx.expense'), icon: 'arrow_downward', activeClass: 'bg-expense-container text-on-expense-container' },
            { id: 'income', label: t('tx.income'), icon: 'arrow_upward', activeClass: 'bg-income-container text-on-income-container' },
          ]}
        />

        {recentForType.length > 0 && (
          <div>
            <p className="mb-2 text-label-md text-on-surface-variant">{t('tx.recent')}</p>
            {/* Two rows that fill column by column and scroll sideways together
                (a single item stays on one row so no empty gap is left) */}
            <div className={`no-scrollbar -mx-4 grid auto-cols-max grid-flow-col ${recentForType.length > 1 ? 'grid-rows-2' : 'grid-rows-1'} gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:-mx-6 sm:px-6`}>
              {recentForType.map((r, idx) => {
                const cat = getCategory(r.categoryId);
                return (
                  <button
                    key={`${r.categoryId}-${r.amount}-${r.note}-${idx}`}
                    type="button"
                    onClick={() => applyRecent(r)}
                    className="state-layer flex h-8 items-center gap-2 whitespace-nowrap rounded-lg border border-outline px-3 text-label-md text-on-surface-variant"
                  >
                    <Emoji size={15}>{getCategoryEmoji(cat)}</Emoji>
                    <span>{cat?.name || t('common.other')}</span>
                    <span className="font-bold tabular-nums text-on-surface">{formatNumber(r.amount)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <MoneyInput label={t('tx.amount')} value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} error={errors.amount} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ChoiceSelect
            label={t('tx.category')}
            required
            options={categoryOptions}
            value={form.categoryId}
            onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
            error={errors.categoryId}
            emptyLabel={t('tx.noCategory')}
          />
          <ChoiceSelect
            label={t('tx.wallet')}
            required
            options={walletOptions}
            value={form.walletId}
            onChange={(v) => setForm((f) => ({ ...f, walletId: v }))}
            error={errors.walletId}
            emptyLabel={t('tx.noWallet')}
          />
        </div>

        {showCafe && (
          <div className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
            <p className="flex items-center gap-2 text-label-lg text-on-surface-variant">
              <Icon name="local_cafe" size={18} />
              {t('cafe.formSection')}
            </p>
            <ChoiceSelect
              label={t('cafe.shop')}
              options={withNone(shopOptions, form.shopId)}
              value={form.shopId}
              onChange={(v) => setForm((f) => ({ ...f, shopId: v }))}
              emptyLabel={t('cafe.noShops')}
            />
            <ChoiceSelect
              label={t('cafe.drink')}
              options={withNone(drinkOptions, form.drinkId)}
              value={form.drinkId}
              onChange={(v) => setForm((f) => ({ ...f, drinkId: v }))}
              emptyLabel={t('cafe.noDrinks')}
            />
            <ImageUpload label={t('cafe.photo')} value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
          </div>
        )}

        <TextInput
          type="datetime-local"
          label={t('tx.datetime')}
          required
          icon="event"
          max={toInputDateTimeLocal(new Date())}
          value={form.datetime}
          onChange={(e) => setForm((f) => ({ ...f, datetime: e.target.value }))}
          error={errors.date}
        />

        <Textarea
          label={t('tx.note')}
          icon="edit_note"
          hint={t('tx.noteHint')}
          error={errors.note}
          value={form.note}
          maxLength={200}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          onBlur={(e) => setForm((f) => ({ ...f, note: e.target.value.trim() }))}
        />
      </form>
    </Modal>
  );
}
