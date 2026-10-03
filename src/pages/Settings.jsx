import { useState } from "react";
import {
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  CaseSensitive,
  Download,
  Database,
  User,
  Info,
} from "lucide-react";
import { useLang } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";
import {
  useAppearance,
  FONT_SIZES,
  DEFAULT_FONT_SIZE,
} from "../context/AppearanceContext";
import { useToast } from "../context/ToastContext";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { useStreakPosts } from "../hooks/useStreakPosts";
import { useTimeStreak } from "../hooks/useTimeStreak";
import { exportPostsAs, POST_COLUMNS, toPlainPost } from "../utils/postExport";
import {
  exportToCsv,
  exportToExcel,
  exportToJson,
  timestampSuffix,
} from "../utils/exportData";
import { formatDateOnly, formatFullDateTime } from "../utils/date";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ExportMenu from "../components/ExportMenu";
import UserCard from "../components/UserCard";

function SettingsCard({ title, hint, icon: Icon, children, delay = 0 }) {
  return (
    <div
      className="stagger-item rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4 sm:p-6"
      style={{ "--stagger-delay": `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] shrink-0">
            <Icon size={16} />
          </span>
        )}
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">
          {title}
        </h3>
      </div>
      {hint && (
        <p className="text-xs text-[var(--color-ink-soft)] mt-1.5 ml-[42px]">
          {hint}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function OptionButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-[var(--radius-control)] border py-4 px-3 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
          : "border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
      }`}
    >
      {Icon && <Icon size={18} />}
      {label}
    </button>
  );
}

export default function Settings() {
  const { t } = useLang();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useAppearance();
  const { installed, canPrompt, promptInstall } = usePwaInstall();
  const { items: posts } = useStreakPosts();
  const { streak } = useTimeStreak();
  const [resetOpen, setResetOpen] = useState(false);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) toast.success(t("settings.installed"));
  };

  const handleReset = () => {
    setTheme("system");
    setFontSize(DEFAULT_FONT_SIZE);
    toast.success(t("settings.resetDone"));
  };

  const themeOptions = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
  ];

  /**
   * Xuất toàn bộ dữ liệu. JSON và Excel gồm cả mốc thời gian lẫn nhật ký,
   * các định dạng còn lại gồm toàn bộ nhật ký.
   */
  const handleExportAll = async (format) => {
    if (!posts.length && !streak) {
      toast.info(t("csv.exportEmpty"));
      return;
    }
    try {
      const columns = POST_COLUMNS.map((c) => ({
        ...c,
        label: t(c.labelKey),
        value: (r) => c.get(r, t),
      }));
      const sorted = [...posts].sort((a, b) =>
        `${b.post_date} ${b.post_time}`.localeCompare(
          `${a.post_date} ${a.post_time}`,
        ),
      );
      const stamp = timestampSuffix();

      if (format === "json") {
        exportToJson(
          {
            exportedAt: new Date().toISOString(),
            timeStreak: streak
              ? {
                  title: streak.title,
                  start_at: streak.start_at,
                  note: streak.note || null,
                }
              : null,
            streakPosts: sorted.map(toPlainPost),
          },
          `streak-logger-toan-bo-du-lieu-${stamp}.json`,
        );
      } else if (format === "excel") {
        const streakColumns = [
          { label: t("timeStreak.fieldTitle"), value: (r) => r.title },
          {
            label: t("timeStreak.milestone"),
            value: (r) => formatFullDateTime(r.start_at),
          },
          { label: t("timeStreak.fieldNote"), value: (r) => r.note || "" },
        ];
        await exportToExcel(
          [
            { name: t("streakPost.title"), columns, rows: sorted },
            {
              name: t("timeStreak.title"),
              columns: streakColumns,
              rows: streak ? [streak] : [],
            },
          ],
          `streak-logger-toan-bo-du-lieu-${stamp}.xlsx`,
        );
      } else if (format === "csv") {
        exportToCsv(
          sorted,
          columns,
          `streak-logger-toan-bo-du-lieu-${stamp}.csv`,
        );
      } else {
        if (!sorted.length) {
          toast.info(t("csv.exportEmpty"));
          return;
        }
        const result = await exportPostsAs(
          format,
          sorted,
          columns,
          t("streakPost.title"),
          "-toan-bo",
        );
        if (result?.truncated) {
          toast.info(t("csv.exportTruncated", { count: result.truncated }));
          return;
        }
      }
      toast.success(t("csv.exportSuccess"));
    } catch {
      toast.error(t("csv.exportError"));
    }
  };

  return (
    <div>
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        actions={
          <Button
            variant="dangerSoft"
            className="w-full"
            icon={RotateCcw}
            onClick={() => setResetOpen(true)}
          >
            {t("settings.reset")}
          </Button>
        }
      />

      <div className="flex flex-col gap-4 max-w-3xl">
        <SettingsCard
          title={t("auth.account")}
          hint={t("auth.accountHint")}
          icon={User}
          delay={0}
        >
          <UserCard />
        </SettingsCard>

        {/* Thẻ cài đặt app chỉ hiện khi người dùng chưa cài. */}
        {!installed && (
          <SettingsCard
            title={t("settings.installApp")}
            hint={t("settings.installAppHint")}
            icon={Download}
            delay={40}
          >
            {canPrompt ? (
              <Button icon={Download} onClick={handleInstall}>
                {t("settings.installNow")}
              </Button>
            ) : (
              <p className="text-xs text-[var(--color-ink-soft)]">
                {t("settings.installNotSupported")}
              </p>
            )}
          </SettingsCard>
        )}

        <SettingsCard
          title={t("settings.appearance")}
          hint={t("settings.appearanceHint")}
          icon={Monitor}
          delay={80}
        >
          <div className="flex gap-2 sm:gap-2.5">
            {themeOptions.map(({ value, icon }) => (
              <OptionButton
                key={value}
                active={theme === value}
                onClick={() => setTheme(value)}
                icon={icon}
                label={t(`theme.${value}`)}
              />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          title={t("settings.fontSize")}
          hint={t("settings.fontSizeHint")}
          icon={CaseSensitive}
          delay={120}
        >
          <div className="flex gap-2 sm:gap-2.5">
            {Object.keys(FONT_SIZES).map((key) => (
              <OptionButton
                key={key}
                active={fontSize === key}
                onClick={() => setFontSize(key)}
                label={
                  <span
                    style={{
                      fontSize:
                        key === "sm"
                          ? "0.85em"
                          : key === "lg"
                            ? "1.15em"
                            : "1em",
                    }}
                  >
                    {t(`settings.fontSizeLabels.${key}`)}
                  </span>
                }
              />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          title={t("settings.data")}
          hint={t("settings.dataHint")}
          icon={Database}
          delay={160}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <ExportMenu
              variant="primary"
              label={t("settings.exportAll")}
              onExport={handleExportAll}
              className="sm:w-56"
            />
            <p className="text-xs text-[var(--color-ink-soft)]">
              {t("settings.exportAllHint")}
            </p>
          </div>
          <p className="text-xs text-[var(--color-ink-soft)] mt-3 tabular">
            {posts.length} {t("stats.entries")}
            {streak
              ? ` · ${t("timeStreak.milestone")}: ${formatDateOnly(streak.start_at)}`
              : ""}
          </p>
        </SettingsCard>

        <SettingsCard title={t("settings.about")} icon={Info} delay={200}>
          <p className="text-sm text-[var(--color-ink-soft)]">
            {t("settings.aboutBody")}
          </p>
        </SettingsCard>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title={t("settings.resetTitle")}
        body={t("settings.resetBody")}
        confirmLabel={t("settings.reset")}
        confirmIcon={RotateCcw}
        tone="primary"
      />
    </div>
  );
}
