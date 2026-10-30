import { NotebookText, Pencil, Trash2, X } from "lucide-react";
import Sheet from "./ui/Sheet";
import Button from "./ui/Button";
import CopyButton from "./ui/CopyButton";
import Badge from "./ui/Badge";
import { useLang } from "../context/LangContext";
import { formatDateOnly, getPeriodOfDay } from "../utils/date";
import { PERIOD_TONE } from "../utils/period";

/** Hộp thoại xem chi tiết một nhật ký. Sửa mở sheet, xóa mở hộp thoại xác nhận ở trang cha. */
export default function StreakPostView({ open, onClose, post, onEdit, onDelete }) {
  const { t } = useLang();
  if (!post) return null;

  const period = getPeriodOfDay(post.post_time);
  const timeStr = post.post_time?.slice(0, 5);
  const dateStr = formatDateOnly(post.post_date);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t("streakPost.viewTitle")}
      footer={
        <>
          <Button variant="secondary" icon={X} onClick={onClose} size="lg">
            {t("common.close")}
          </Button>
          <Button
            variant="danger"
            size="lg"
            icon={Trash2}
            onClick={() => {
              onDelete(post);
              onClose();
            }}
          >
            {t("common.delete")}
          </Button>
          <Button
            size="lg"
            icon={Pencil}
            onClick={() => {
              onEdit(post);
              onClose();
            }}
          >
            {t("common.edit")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="w-14 h-14 rounded-[20px] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] flex items-center justify-center shrink-0">
            <NotebookText size={26} />
          </span>
          <Badge tone={PERIOD_TONE[period]}>{t(`streakPost.period.${period}`)}</Badge>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-[20px] bg-[var(--md-surface-container-highest)] pl-5 pr-2 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--md-on-surface-variant)]">{t("streakPost.fieldDuration")}</p>
            <p className="text-xl font-bold text-[var(--md-on-surface)] break-words">{post.duration}</p>
          </div>
          <CopyButton text={post.duration} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[20px] bg-[var(--md-surface-container-highest)] px-5 py-3">
            <p className="text-xs font-semibold text-[var(--md-on-surface-variant)]">{t("streakPost.fieldDate")}</p>
            <p className="text-sm font-semibold text-[var(--md-on-surface)] mt-0.5">{dateStr}</p>
          </div>
          <div className="rounded-[20px] bg-[var(--md-surface-container-highest)] px-5 py-3">
            <p className="text-xs font-semibold text-[var(--md-on-surface-variant)]">{t("streakPost.fieldTime")}</p>
            <p className="text-sm font-semibold text-[var(--md-on-surface)] tabular mt-0.5">{timeStr}</p>
          </div>
        </div>

        {post.description && (
          <div className="border-t border-[var(--md-outline-variant)] pt-4">
            <p className="text-xs font-semibold text-[var(--md-on-surface-variant)] mb-1.5">{t("streakPost.fieldDescription")}</p>
            <p className="text-sm text-[var(--md-on-surface)] whitespace-pre-wrap leading-relaxed break-words">{post.description}</p>
          </div>
        )}
      </div>
    </Sheet>
  );
}
