import { useEffect, useState } from 'react';
import { notify } from '../utils/notify';
import Modal from './ui/Modal';
import Button from './ui/Button';
import TextInput from './ui/TextInput';
import Textarea from './ui/Textarea';
import ImageUpload from './ui/ImageUpload';
import RatingInput from './ui/RatingInput';
import { useData } from '../contexts/DataContext';
import { useT } from '../i18n';
import { validateCafeShop, trimValue } from '../utils/validators';

const blank = { name: '', address: '', imageUrl: '', description: '', rating: 0 };

export default function CafeShopFormModal({ open, onClose, editing }) {
  const t = useT();
  const { cafeShops, addCafeShop, updateCafeShop } = useData();
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? { name: editing.name, address: editing.address || '', imageUrl: editing.imageUrl || '', description: editing.description || '', rating: editing.rating || 0 }
        : blank,
    );
    setErrors({});
  }, [open, editing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, name: trimValue(form.name), address: trimValue(form.address), description: trimValue(form.description) };
    const existing = cafeShops.filter((s) => s.id !== editing?.id).map((s) => s.name);
    const { valid, errors: errs } = validateCafeShop(payload, existing, t);
    setErrors(errs);
    if (!valid) return;
    setSaving(true);
    try {
      if (editing) await updateCafeShop(editing.id, payload);
      else await addCafeShop(payload);
      onClose();
    } catch (err) {
      console.error(err);
      notify.error(t('cafe.shopSaveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('cafe.shopEditTitle') : t('cafe.shopAddTitle')}
      variant="sheet"
      footer={
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button type="button" variant="text" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="cafe-shop-form" icon="check" loading={saving}>
            {editing ? t('common.save') : t('common.add')}
          </Button>
        </div>
      }
    >
      <form id="cafe-shop-form" onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2" noValidate>
        <ImageUpload label={t('cafe.photo')} value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
        <TextInput label={t('cafe.shopName')} required icon="storefront" maxLength={60} value={form.name} onChange={set('name')} error={errors.name} />
        <TextInput label={t('cafe.address')} icon="location_on" maxLength={200} value={form.address} onChange={set('address')} error={errors.address} />
        <RatingInput label={t('cafe.rating')} value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} error={errors.rating} />
        <Textarea label={t('cafe.description')} icon="edit_note" maxLength={500} value={form.description} onChange={set('description')} error={errors.description} />
      </form>
    </Modal>
  );
}
