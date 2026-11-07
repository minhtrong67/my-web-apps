import { useState } from "react";
import { Pencil, Hourglass, Plus, RotateCcw } from "lucide-react";
import { useLang } from "../context/LangContext";
import { useToast } from "../context/ToastContext";
import { useTimeStreak } from "../hooks/useTimeStreak";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import TimeStreakCard from "../components/TimeStreakCard";
import TimeStreakForm from "../components/TimeStreakForm";
import { SkeletonCard } from "../components/ui/Skeleton";

export default function TimeStreaks() {
  const { t } = useLang();
  const toast = useToast();
  const { streak, loading, error, save } = useTimeStreak();

  const [formOpen, setFormOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      await save(payload);
      toast.success(t(streak ? "toast.updated" : "toast.saved"));
    } catch (err) {
      toast.error(t("toast.error"));
      throw err;
    }
  };

  /** Đặt lại: đưa mốc về đúng thời điểm hiện tại (ngày và giờ bây giờ), giữ nguyên tiêu đề và ghi chú. */
  const handleReset = async () => {
    try {
      await save({ start_at: new Date().toISOString() });
      toast.success(t("timeStreak.resetDone"));
    } catch (err) {
      toast.error(t("toast.error"));
      throw err;
    }
  };

  return (
    <div>
      <PageHeader
        title={t("timeStreak.title")}
        subtitle={t("timeStreak.subtitle")}
      />

      {loading && <SkeletonCard className="max-w-xl" />}

      {!loading && error && (
        <p className="mb-4 text-sm font-medium text-[var(--md-error)]">{t("toast.loadError")}</p>
      )}

      {!loading && !streak && (
        <EmptyState
          icon={Hourglass}
          title={t("timeStreak.empty")}
          action={
            <Button icon={Plus} onClick={() => setFormOpen(true)}>
              {t("timeStreak.setupTitle")}
            </Button>
          }
        />
      )}

      {streak && (
        <TimeStreakCard
          streak={streak}
          onEdit={() => setFormOpen(true)}
          onReset={() => setResetOpen(true)}
        />
      )}

      <TimeStreakForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={streak}
      />

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title={t("timeStreak.resetTitle")}
        body={t("timeStreak.resetBody")}
        confirmLabel={t("timeStreak.reset")}
        confirmIcon={RotateCcw}
        tone="warning"
      />
    </div>
  );
}
