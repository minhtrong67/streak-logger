import { useRef, useState } from 'react'
import { Search, Upload, RotateCcw, SlidersHorizontal, ChevronDown, Plus, Loader2 } from 'lucide-react'
import Input from './Input'
import Select from './Select'
import Button from './Button'
import ExportMenu from '../ExportMenu'
import { useLang } from '../../context/LangContext'
import { IMPORT_ACCEPT } from '../../utils/importData'

/**
 * Thanh công cụ của danh sách: Nhập / Xuất / Thêm, cùng một accordion
 * "Tìm kiếm và lọc" gồm ô tìm kiếm, sắp xếp và các bộ lọc bổ sung (children).
 */
export default function Toolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  sortOptions,
  onImport,
  onExport,
  onAdd,
  onResetFilters,
  hasActiveFilters,
  exportDisabled = false,
  children,
}) {
  const { t } = useLang()
  const fileRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // cho phép chọn lại cùng một tệp
    if (!file) return
    setImporting(true)
    try {
      await onImport(file)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] p-3 sm:p-4 mb-4 flex flex-col">
      <div className="grid grid-cols-3 sm:flex sm:flex-wrap sm:justify-end gap-2 mb-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title={t('common.importHint')}
          disabled={importing}
          className="justify-center inline-flex items-center gap-1.5 font-medium text-sm px-3 sm:px-4 py-2 rounded-[var(--radius-control)] border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-all duration-150 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {importing ? <Loader2 size={16} className="shrink-0 animate-spin" /> : <Upload size={16} className="shrink-0" />}
          <span>{importing ? t('common.importing') : t('common.import')}</span>
        </button>
        <input ref={fileRef} type="file" accept={IMPORT_ACCEPT} className="hidden" onChange={handleFile} />

        <ExportMenu onExport={onExport} disabled={exportDisabled} />

        <Button icon={Plus} onClick={onAdd} className="w-full sm:w-auto">
          {t('common.addNew')}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
        className="relative flex items-center justify-between gap-2 w-full px-3.5 py-2.5 rounded-[var(--radius-control)] bg-[var(--color-surface-2)] text-sm font-medium text-[var(--color-ink)] hover:brightness-95 transition-all duration-150 active:scale-[0.99]"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[var(--color-primary)]" />
          {t('common.filter')}
          {hasActiveFilters && (
            <span className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-[var(--color-primary)] text-[var(--color-primary-ink)]">
              {t('common.filterActive')}
            </span>
          )}
        </span>
        <ChevronDown size={16} className={`text-[var(--color-ink-soft)] transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Accordion: animate bằng grid-template-rows nên mở/đóng mượt, không cần max-height. */}
      <div className={`accordion ${filtersOpen ? 'accordion-open' : ''}`} aria-hidden={!filtersOpen}>
        <div>
          <div className="flex flex-col gap-3 pt-3 pb-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--color-ink-soft)]">{t('common.search')}</span>
                <Input
                  icon={Search}
                  placeholder={t('common.searchPlaceholder')}
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  tabIndex={filtersOpen ? 0 : -1}
                />
              </div>
              {sortOptions && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-[var(--color-ink-soft)]">{t('common.sort')}</span>
                  <Select value={sort} onChange={(e) => onSortChange(e.target.value)} tabIndex={filtersOpen ? 0 : -1}>
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              {children}
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onResetFilters}
                  tabIndex={filtersOpen ? 0 : -1}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)] px-3 py-2 rounded-lg bg-[var(--color-danger-soft)] hover:brightness-95 transition-all duration-150 active:scale-95"
                >
                  <RotateCcw size={12} />
                  {t('common.resetFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
