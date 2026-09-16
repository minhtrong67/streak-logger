import {
  Sun,
  Moon,
  Monitor,
  Check,
  RotateCcw,
  Palette,
  CaseSensitive,
  Shuffle,
  Download,
  CheckCircle2,
} from "lucide-react";
import { useLang } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";
import {
  useAppearance,
  FONT_SIZES,
  COLOR_THEMES,
} from "../context/AppearanceContext";
import { useToast } from "../context/ToastContext";
import { usePwaInstall } from "../hooks/usePwaInstall";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Switch from "../components/ui/Switch";

function SettingsCard({ title, hint, icon: Icon, children, delay = 0 }) {
  return (
    <div
      className="stagger-item card-hover rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-5 sm:p-6"
      style={{ "--stagger-delay": `${delay}ms` }}
    >
      <div className="flex items-center gap-2.5 mb-0.5">
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
        <p className="text-xs text-[var(--color-ink-soft)] mt-1 mb-4 ml-[42px]">
          {hint}
        </p>
      )}
      {!hint && <div className="mb-4" />}
      {children}
    </div>
  );
}

function OptionButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-[var(--radius-control)] border py-4 sm:py-3.5 px-3 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
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
  const { theme, setTheme } = useTheme();
  const {
    fontSize,
    setFontSize,
    colorTheme,
    setColorTheme,
    randomColor,
    setRandomColor,
    shuffleColor,
  } = useAppearance();
  const toast = useToast();
  const { installed, canPrompt, promptInstall } = usePwaInstall();

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) toast.success(t("settings.installed"));
  };

  const themeOptions = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
  ];

  const handleReset = () => {
    setTheme("system");
    setFontSize("md");
    setColorTheme("material");
    setRandomColor(false);
    toast.success(t("settings.resetDone"));
  };

  return (
    <div>
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        actions={
          <Button variant="danger" icon={RotateCcw} onClick={handleReset}>
            {t("settings.reset")}
          </Button>
        }
      />

      <div className="flex flex-col gap-4 max-w-3xl">
        {!installed && (
          <SettingsCard
            title={t("settings.installApp")}
            hint={t("settings.installAppHint")}
            icon={Download}
            delay={0}
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
        {installed && (
          <SettingsCard
            title={t("settings.installApp")}
            hint={t("settings.installAppHint")}
            icon={CheckCircle2}
            delay={0}
          >
            <div className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-success)]">
              <CheckCircle2 size={16} />
              {t("settings.installed")}
            </div>
          </SettingsCard>
        )}

        <SettingsCard
          title={t("settings.appearance")}
          hint={t("settings.appearanceHint")}
          icon={Monitor}
          delay={40}
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
          delay={80}
        >
          <div className="flex gap-2 sm:gap-2.5">
            {Object.entries(FONT_SIZES).map(([key]) => (
              <OptionButton
                key={key}
                active={fontSize === key}
                onClick={() => setFontSize(key)}
                label={
                  <span
                    style={{
                      fontSize:
                        key === "sm"
                          ? "0.8em"
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
          title={t("settings.color")}
          hint={t("settings.colorHint")}
          icon={Palette}
          delay={120}
        >
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(COLOR_THEMES).map(([key, c]) => (
              <button
                key={key}
                onClick={() => setColorTheme(key)}
                aria-pressed={colorTheme === key}
                title={t(`settings.colorLabels.${key}`)}
                className="flex flex-col items-center gap-1.5 group py-1"
              >
                <span
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-150 group-active:scale-90 group-hover:scale-105"
                  style={{
                    backgroundColor: c.swatch,
                    boxShadow:
                      colorTheme === key
                        ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${c.swatch}`
                        : "none",
                  }}
                >
                  {colorTheme === key && (
                    <Check size={16} className="text-white" />
                  )}
                </span>
                <span className="text-[11px] sm:text-xs text-[var(--color-ink-soft)] truncate max-w-full">
                  {t(`settings.colorLabels.${key}`)}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--color-border)]">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-ink)]">
                {t("settings.randomColor")}
              </p>
              <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
                {t("settings.randomColorHint")}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                icon={Shuffle}
                onClick={shuffleColor}
                aria-label={t("settings.shuffleNow")}
              />
              <Switch
                checked={randomColor}
                onChange={setRandomColor}
                label={t("settings.randomColor")}
              />
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
