import { useEffect, useState } from 'react';
import { notify } from '../utils/notify';
import Modal from './ui/Modal';
import Button from './ui/Button';
import TextInput from './ui/TextInput';
import Textarea from './ui/Textarea';
import ImageUpload from './ui/ImageUpload';
import { useData } from '../contexts/DataContext';
import { useT } from '../i18n';
import { validateCafeDrink, trimValue } from '../utils/validators';

const blank = { name: '', imageUrl: '', description: '' };

export default function CafeDrinkFormModal({ open, onClose, editing }) {
  const t = useT();
  const { cafeDrinks, addCafeDrink, updateCafeDrink } = useData();
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(editing ? { name: editing.name, imageUrl: editing.imageUrl || '', description: editing.description || '' } : blank);
    setErrors({});
  }, [open, editing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, name: trimValue(form.name), description: trimValue(form.description) };
    const existing = cafeDrinks.filter((d) => d.id !== editing?.id).map((d) => d.name);
    const { valid, errors: errs } = validateCafeDrink(payload, existing, t);
    setErrors(errs);
    if (!valid) return;
    setSaving(true);
    try {
      if (editing) await updateCafeDrink(editing.id, payload);
      else await addCafeDrink(payload);
      onClose();
    } catch (err) {
      console.error(err);
      notify.error(t('cafe.drinkSaveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('cafe.drinkEditTitle') : t('cafe.drinkAddTitle')}
      variant="sheet"
      footer={
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button type="button" variant="text" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="cafe-drink-form" icon="check" loading={saving}>
            {editing ? t('common.save') : t('common.add')}
          </Button>
        </div>
      }
    >
      <form id="cafe-drink-form" onSubmit={handleSubmit} className="flex flex-col gap-5 pb-2" noValidate>
        <ImageUpload label={t('cafe.photo')} value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
        <TextInput label={t('cafe.drinkName')} required icon="local_cafe" maxLength={60} value={form.name} onChange={set('name')} error={errors.name} />
        <Textarea label={t('cafe.description')} icon="edit_note" maxLength={500} value={form.description} onChange={set('description')} error={errors.description} />
      </form>
    </Modal>
  );
}
