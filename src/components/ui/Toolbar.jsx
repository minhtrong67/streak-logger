import {
  Search,
  Upload,
  Download,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  FileDown,
  Plus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Input from "./Input";
import Select from "./Select";
import { useRipple, RippleLayer } from "../../hooks/useRipple";
import { useLang } from "../../context/LangContext";
import { IMPORT_ACCEPT } from "../../utils/csv";
import Button from "./Button";

export default function Toolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  sortOptions,
  onImport,
  onExport,
  onResetFilters,
  hasActiveFilters,
  children,
  setEditing,
  setFormOpen,
}) {
  const { t } = useLang();
  const fileRef = useRef(null);
  const exportRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const mainRipple = useRipple();
  const arrowRipple = useRipple();

  useEffect(() => {
    if (!exportOpen) return;
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen]);

  const exportFormats = [
    { key: "csv", label: t("common.exportCsv"), icon: FileText },
    { key: "excel", label: t("common.exportExcel"), icon: FileSpreadsheet },
    { key: "pdf", label: t("common.exportPdf"), icon: FileDown },
  ];

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] p-3.5 sm:p-4 mb-5 flex flex-col gap-3.5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <Input
            icon={Search}
            placeholder={t("common.searchPlaceholder")}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          {sortOptions && (
            <Select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full sm:min-w-[9.5rem] sm:w-auto"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          )}
          <div className={`grid gap-2 grid-cols-2 sm:flex`}>
            {/* Import — CSV/Excel accepted, but the visible label is explicit
                per design spec ("Import CSV"). */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title={t("common.importHint")}
              disabled={importing}
              className="justify-center inline-flex items-center gap-1.5 font-medium text-sm px-4 py-2 rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-all duration-150 active:scale-[0.97] disabled:opacity-60"
            >
              <Upload size={16} className="shrink-0" />
              <span>{t("common.importCsv")}</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept={IMPORT_ACCEPT}
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setImporting(true);
                try {
                  await onImport(file);
                } finally {
                  setImporting(false);
                }
              }}
            />

            {/* Export — true split button: the main segment runs the default
                (CSV) export immediately, the narrow arrow segment opens the
                menu with all 3 formats. */}
            <div className="relative flex" ref={exportRef}>
              <div className="inline-flex w-full rounded-[var(--radius-control)] border border-[var(--color-border)] overflow-hidden">
                <button
                  type="button"
                  onPointerDown={mainRipple.onPointerDown}
                  onClick={() => onExport("csv")}
                  className="relative overflow-hidden flex-1 inline-flex items-center justify-center gap-1.5 font-medium text-sm px-3.5 py-2 text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors active:scale-[0.97]"
                  title={t("common.exportCsv")}
                >
                  <RippleLayer ripples={mainRipple.ripples} tone="dark" />
                  <Download size={16} className="shrink-0" />
                  <span>{t("common.export")}</span>
                </button>
                <button
                  type="button"
                  onPointerDown={arrowRipple.onPointerDown}
                  onClick={() => setExportOpen((v) => !v)}
                  className="relative overflow-hidden inline-flex items-center justify-center px-2 border-l border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)] transition-colors active:scale-[0.97]"
                  aria-label={t("common.exportMoreOptions")}
                  aria-expanded={exportOpen}
                >
                  <RippleLayer ripples={arrowRipple.ripples} tone="dark" />
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${exportOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              {exportOpen && (
                <div className="stagger-item absolute right-0 top-full mt-2 z-20 w-48 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-modal)] p-1.5 flex flex-col">
                  {exportFormats.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setExportOpen(false);
                        onExport(key);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors text-left"
                    >
                      <Icon
                        size={15}
                        className="text-[var(--color-ink-soft)] shrink-0"
                      />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* /* Filters */}
            <div>
              {children && (
                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="relative justify-center inline-flex items-center gap-1.5 font-medium text-sm px-4 py-2 rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-all duration-150 active:scale-[0.97] w-full"
                  aria-expanded={filtersOpen}
                >
                  <SlidersHorizontal size={16} className="shrink-0" />
                  <span>{t("common.filter")}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
                  />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--color-surface)]" />
                  )}
                </button>
              )}
            </div>

            <Button
              icon={Plus}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              {t("common.addNew")}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter accordion — animates open/closed via grid-template-rows
          rather than an abrupt show/hide. */}
      {children && (
        <div className={`accordion ${filtersOpen ? "accordion-open" : ""}`}>
          <div>
            <div className="rounded-[var(--radius-control)] bg-[var(--color-surface-2)] p-3.5 sm:p-3 flex flex-col gap-3 mt-0.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-soft)]">
                  <SlidersHorizontal size={13} />
                  {t("common.filter")}
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={onResetFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)] px-2.5 py-1.5 rounded-lg bg-[var(--color-danger-soft)] hover:brightness-95 transition-all duration-150 active:scale-95"
                  >
                    <RotateCcw size={12} />
                    {t("common.resetFilters")}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
