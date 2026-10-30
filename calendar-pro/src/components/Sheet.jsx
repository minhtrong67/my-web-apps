import { useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { useTranslation } from "../i18n/useTranslation";
import { useExitTransition } from "../hooks/useExitTransition";
import { useModal } from "../hooks/useModal";

/**
 * Bottom sheet Expressive: nền tonal, bo góc trên 28px, tay cầm 32×4; vào bằng spring nảy nhẹ.
 * Có animation vào/ra, vuốt xuống ở phần tay cầm để đóng (cảm ứng), Esc/scrim để đóng,
 * giữ focus trong sheet và trả focus về nút đã mở nó.
 */
export default function Sheet({ open, onClose, title, children }) {
  const { t } = useTranslation();
  const { mounted, closing } = useExitTransition(open, 220);
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  useModal(open, onClose, panelRef);

  if (!mounted) return null;

  function onPointerDown(e) {
    if (e.pointerType === "mouse") return;
    dragRef.current = { startY: e.clientY, startT: performance.now(), dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    panelRef.current.style.transition = "none";
  }
  function onPointerMove(e) {
    const d = dragRef.current;
    if (!d) return;
    d.dy = Math.max(0, e.clientY - d.startY);
    panelRef.current.style.transform = `translateY(${d.dy}px)`;
  }
  function onPointerUp() {
    const d = dragRef.current;
    const el = panelRef.current;
    if (!d || !el) return;
    dragRef.current = null;
    const velocity = d.dy / Math.max(1, performance.now() - d.startT);
    if (d.dy > 110 || velocity > 0.6) {
      // Đóng: animation thoát bắt đầu đúng từ vị trí đang kéo
      el.style.setProperty("--drag-y", `${d.dy}px`);
      el.style.transform = "";
      onClose();
    } else {
      el.style.transition = "transform var(--dur-spatial) var(--ease-spatial)";
      el.style.transform = "translateY(0)";
      setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.style.transition = "";
          panelRef.current.style.transform = "";
        }
      }, 260);
    }
  }

  // Render vào document.body qua Portal để tránh bị lệch vị trí khi phần tử cha
  // có transform/animation (transform tạo "containing block" mới cho position:fixed).
  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`absolute inset-0 bg-black/40 ${closing ? "scrim-out" : "scrim-in"}`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`${closing ? "animate-drawer-down" : "animate-drawer-up"} relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-surface-low shadow-elevated outline-none md:max-h-[85dvh] md:max-w-lg md:rounded-[28px]`}
      >
        <div
          className="shrink-0 touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="mx-auto mt-3 h-1 w-8 rounded-full bg-outline/50 md:hidden" aria-hidden="true" />
          <div className="flex items-center justify-between pb-1 pl-5 pr-2 pt-3 md:pt-4">
            <h2 className="text-title-lg text-on-surface">{title}</h2>
            <button
              onClick={onClose}
              className="state morph focus-ring flex h-12 w-12 items-center justify-center rounded-full text-on-surface-variant"
              aria-label={t("common.close")}
            >
              <Icon name="close" size={24} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-2 sm:px-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
