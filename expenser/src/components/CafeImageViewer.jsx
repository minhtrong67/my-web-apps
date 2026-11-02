import Modal from './ui/Modal';

/** Full-size photo viewer (opened from a cafe transaction's thumbnail). */
export default function CafeImageViewer({ src, title, onClose }) {
  return (
    <Modal open={!!src} onClose={onClose} title={title || ''} size="lg">
      {src && <img src={src} alt={title || ''} className="max-h-[70dvh] w-full rounded-xl object-contain" referrerPolicy="no-referrer" />}
    </Modal>
  );
}
