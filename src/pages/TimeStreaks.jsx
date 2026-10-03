import { useState } from "react";
import { Pencil, Hourglass, Plus } from "lucide-react";
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
  const { streak, loading, error, save, remove } = useTimeStreak();

  const [formOpen, setFormOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      await save(payload);
      toast.success(t("toast.saved"));
    } catch (err) {
      toast.error(t("toast.error"));
      throw err;
    }
  };

  const handleReset = async () => {
    try {
      await remove();
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("toast.error"));
    }
  };

  return (
    <div>
      <PageHeader
        title={t("timeStreak.title")}
        subtitle={t("timeStreak.subtitle")}
        actions={
          streak && (
            <Button
              icon={Pencil}
              variant="primary"
              onClick={() => setFormOpen(true)}
            >
              {t("common.edit")}
            </Button>
          )
        }
      />

      {loading && <SkeletonCard className="max-w-xl" />}

      {!loading && error && (
        <p className="mb-4 text-sm text-[var(--color-danger)]">{t("toast.loadError")}</p>
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
      />
    </div>
  );
}
