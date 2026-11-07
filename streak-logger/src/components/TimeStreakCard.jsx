import { Pencil, RotateCcw, Hourglass } from "lucide-react";
import { useLang } from "../context/LangContext";
import { useNow } from "../hooks/useNow";
import { computeElapsedParts, formatElapsedParts, formatFullDateTime } from "../utils/date";
import CopyButton from "./ui/CopyButton";
import IconButton from "./ui/IconButton";
import Badge from "./ui/Badge";

export default function TimeStreakCard({ streak, onEdit, onReset }) {
  const { t } = useLang();
  const now = useNow(1000);
  const parts = computeElapsedParts(streak.start_at, now);
  const elapsedStr = formatElapsedParts(parts, t);
  const currentStr = formatFullDateTime(now);
  const milestoneStr = formatFullDateTime(streak.start_at);

  return (
    <div className="card-hover relative rounded-[var(--radius-card)] bg-[var(--md-surface-container-low)] p-5 sm:p-6 flex flex-col gap-5 max-w-xl">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-14 h-14 rounded-[20px] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] flex items-center justify-center">
            <Hourglass size={26} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-xl tracking-tight text-[var(--md-on-surface)] truncate">{streak.title}</h3>
            {streak.note && <p className="text-sm text-[var(--md-on-surface-variant)] truncate">{streak.note}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <IconButton tone="primary" icon={Pencil} label={t("common.edit")} onClick={() => onEdit(streak)} />
          <IconButton tone="danger" icon={RotateCcw} label={t("timeStreak.reset")} onClick={() => onReset(streak)} />
        </div>
      </div>

      {parts.isFuture && (
        <Badge tone="info" className="w-fit">
          {t("timeStreak.future")}
        </Badge>
      )}

      <div className="rounded-[24px] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] pl-5 pr-2 py-4">
        <p className="text-xs font-semibold opacity-80 mb-1">
          {parts.isFuture ? t("timeStreak.countdownLabel") : t("timeStreak.elapsed")}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="tabular text-xl sm:text-3xl font-bold leading-snug">{elapsedStr}</p>
          <CopyButton text={elapsedStr} label={t("timeStreak.copyElapsed")} className="shrink-0 !text-[var(--md-on-primary-container)]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center justify-between gap-2 rounded-[20px] bg-[var(--md-surface-container-highest)] pl-5 pr-2 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--md-on-surface-variant)]">{t("timeStreak.current")}</p>
            <p className="text-[var(--md-on-surface)] text-sm font-medium mt-1 tabular">{currentStr}</p>
          </div>
          <CopyButton text={currentStr} label={t("timeStreak.copyCurrent")} className="shrink-0" />
        </div>
        <div className="flex items-center justify-between gap-2 rounded-[20px] bg-[var(--md-surface-container-highest)] pl-5 pr-2 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--md-on-surface-variant)]">{t("timeStreak.milestone")}</p>
            <p className="text-[var(--md-on-surface)] text-sm font-medium mt-1">{milestoneStr}</p>
          </div>
          <CopyButton text={milestoneStr} label={t("timeStreak.copyMilestone")} className="shrink-0" />
        </div>
      </div>
    </div>
  );
}
