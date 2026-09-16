import { Pencil, RotateCcw, Hourglass } from "lucide-react";
import { useLang } from "../context/LangContext";
import { useNow } from "../hooks/useNow";
import {
  computeElapsedParts,
  formatElapsedParts,
  formatFullDateTime,
} from "../utils/date";
import CopyButton from "./ui/CopyButton";
import IconButton from "./ui/IconButton";
import Badge from "./ui/Badge";

export default function TimeStreakCard({ streak, onEdit, onReset }) {
  const { t, lang } = useLang();
  const now = useNow(1000);
  const parts = computeElapsedParts(streak.start_at, now);
  const elapsedStr = formatElapsedParts(parts, t);
  const currentStr = formatFullDateTime(now, lang);
  const milestoneStr = formatFullDateTime(streak.start_at, lang);

  return (
    <div className="card-hover relative rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-5 sm:p-6 flex flex-col gap-4 max-w-xl">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
            <Hourglass size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-[var(--color-ink)] truncate">
              {streak.title}
            </h3>
            {streak.note && (
              <p className="text-xs text-[var(--color-ink-soft)] truncate">
                {streak.note}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <IconButton
            icon={Pencil}
            label={t("common.edit")}
            onClick={() => onEdit(streak)}
          />
          <IconButton
            icon={RotateCcw}
            label={t("timeStreak.reset")}
            onClick={() => onReset(streak)}
          />
        </div>
      </div>

      {parts.isFuture && (
        <Badge tone="info" className="w-fit">
          {t("timeStreak.future")}
        </Badge>
      )}

      <div className="rounded-xl bg-[var(--color-surface-2)] px-4 py-4">
        <p className="text-xs text-[var(--color-ink-soft)] mb-1">
          {parts.isFuture
            ? t("timeStreak.countdownLabel")
            : t("timeStreak.elapsed")}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="tabular text-xl sm:text-2xl font-semibold text-[var(--color-ink)] leading-snug">
            {elapsedStr}
          </p>
          <CopyButton
            text={elapsedStr}
            label={t("timeStreak.copyElapsed")}
            className="shrink-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="min-w-0 ">
            <p className="text-xs text-[var(--color-ink-soft)]">
              {t("timeStreak.current")}
            </p>
            <p className="text-[var(--color-ink)] text-sm mt-2">{currentStr}</p>
          </div>
          <CopyButton
            text={currentStr}
            label={t("timeStreak.copyCurrent")}
            className="shrink-0"
          />
        </div>
        <div className="flex items-center justify-between gap-2 text-sm border-t border-[var(--color-border)] pt-2">
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-ink-soft)]">
              {t("timeStreak.milestone")}
            </p>
            <p className="text-[var(--color-ink)] text-sm mt-2">
              {milestoneStr}
            </p>
          </div>
          <CopyButton
            text={milestoneStr}
            label={t("timeStreak.copyMilestone")}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
