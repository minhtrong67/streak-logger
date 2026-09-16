import { Pencil, Trash2 } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import CopyButton from "./ui/CopyButton";
import Badge from "./ui/Badge";
import { useLang } from "../context/LangContext";
import { formatDateOnly, getPeriodOfDay } from "../utils/date";
import { PERIOD_TONE } from "../utils/period";

export default function StreakPostView({
  open,
  onClose,
  post,
  onEdit,
  onDelete,
}) {
  const { t } = useLang();
  if (!post) return null;

  const period = getPeriodOfDay(post.post_time);
  const timeStr = post.post_time?.slice(0, 5);
  const dateStr = formatDateOnly(post.post_date);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("streakPost.viewTitle")}
      footer={
        <>
          <Button
            size="lg"
            variant="danger"
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
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-ink-soft)]">
              {t("streakPost.fieldDuration")}
            </p>
            <p className="text-lg font-semibold text-[var(--color-ink)] truncate">
              {post.duration}
            </p>
          </div>
          <CopyButton text={post.duration} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[var(--color-ink-soft)]">
              {t("streakPost.fieldDate")}
            </p>
            <p className="text-sm text-[var(--color-ink)]">{dateStr}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-ink-soft)]">
              {t("streakPost.fieldTime")}
            </p>
            <p className="text-sm text-[var(--color-ink)] tabular">{timeStr}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-[var(--color-ink-soft)] mb-1">
            {t("streakPost.filterPeriod")}
          </p>
          <Badge tone={PERIOD_TONE[period]}>
            {t(`streakPost.period.${period}`)}
          </Badge>
        </div>

        {post.description && (
          <div className="border-t border-[var(--color-border)] pt-3">
            <p className="text-xs text-[var(--color-ink-soft)] mb-1">
              {t("streakPost.fieldDescription")}
            </p>
            <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap leading-relaxed">
              {post.description}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
