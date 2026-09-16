import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  NotebookText,
  Pencil,
  Trash2,
  Eye,
  Copy,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search as SearchIcon,
} from "lucide-react";
import { useLang } from "../context/LangContext";
import { useToast } from "../context/ToastContext";
import { useStreakPosts } from "../hooks/useStreakPosts";
import PageHeader from "../components/ui/PageHeader";
import Toolbar from "../components/ui/Toolbar";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import Checkbox from "../components/ui/Checkbox";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import IconButton from "../components/ui/IconButton";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import StreakPostForm from "../components/StreakPostForm";
import StreakPostView from "../components/StreakPostView";
import { SkeletonTableRow, SkeletonCard } from "../components/ui/Skeleton";
import {
  exportToCsv,
  exportToExcel,
  exportToPdf,
  parseDataFile,
} from "../utils/csv";
import { formatDateOnly, getPeriodOfDay, PERIOD_ORDER } from "../utils/date";
import { PERIOD_TONE } from "../utils/period";

const PAGE_SIZE = 20;

export default function StreakPosts() {
  const { t } = useLang();
  const toast = useToast();
  const { items, loading, create, update, remove, removeMany, bulkCreate } =
    useStreakPosts();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [periodFilter, setPeriodFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [colDuration, setColDuration] = useState("");
  const [colDescription, setColDescription] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const sortOptions = [
    { value: "newest", label: t("common.newest") },
    { value: "oldest", label: t("common.oldest") },
    { value: "nameAsc", label: t("common.nameAsc") },
    { value: "nameDesc", label: t("common.nameDesc") },
  ];

  const filtered = useMemo(() => {
    let list = items.filter((it) => {
      const matchSearch =
        it.duration.toLowerCase().includes(search.toLowerCase()) ||
        (it.description || "").toLowerCase().includes(search.toLowerCase());
      const matchPeriod =
        !periodFilter || getPeriodOfDay(it.post_time) === periodFilter;
      const matchFrom = !fromDate || it.post_date >= fromDate;
      const matchTo = !toDate || it.post_date <= toDate;
      const matchColDuration =
        !colDuration ||
        it.duration.toLowerCase().includes(colDuration.toLowerCase());
      const matchColDescription =
        !colDescription ||
        (it.description || "")
          .toLowerCase()
          .includes(colDescription.toLowerCase());
      return (
        matchSearch &&
        matchPeriod &&
        matchFrom &&
        matchTo &&
        matchColDuration &&
        matchColDescription
      );
    });
    list = [...list].sort((a, b) => {
      const dtA = new Date(`${a.post_date}T${a.post_time}`);
      const dtB = new Date(`${b.post_date}T${b.post_time}`);
      if (sort === "newest") return dtB - dtA;
      if (sort === "oldest") return dtA - dtB;
      if (sort === "nameAsc") return a.duration.localeCompare(b.duration);
      if (sort === "nameDesc") return b.duration.localeCompare(a.duration);
      return 0;
    });
    return list;
  }, [
    items,
    search,
    sort,
    periodFilter,
    fromDate,
    toDate,
    colDuration,
    colDescription,
  ]);

  const hasActiveFilters =
    search !== "" ||
    sort !== "newest" ||
    periodFilter !== "" ||
    fromDate !== "" ||
    toDate !== "" ||
    colDuration !== "" ||
    colDescription !== "";

  // Any filter/search change can shrink the result set below the current
  // page — always snap back to page 1 so the table never renders empty.
  useEffect(() => {
    setPage(1);
  }, [
    search,
    sort,
    periodFilter,
    fromDate,
    toDate,
    colDuration,
    colDescription,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const resetFilters = () => {
    setSearch("");
    setSort("newest");
    setPeriodFilter("");
    setFromDate("");
    setToDate("");
    setColDuration("");
    setColDescription("");
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await update(editing.id, payload);
      } else {
        await create(payload);
      }
      toast.success(t("toast.saved"));
    } catch (err) {
      toast.error(err.message || t("toast.error"));
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleting.id);
      toast.success(t("toast.deleted"));
    } catch (err) {
      toast.error(err.message || t("toast.error"));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await removeMany(selected);
      setSelected([]);
      toast.success(t("toast.deleted"));
    } catch (err) {
      toast.error(err.message || t("toast.error"));
    }
  };

  const columns = [
    { label: t("common.date"), value: (r) => formatDateOnly(r.post_date) },
    { label: t("common.time"), value: (r) => r.post_time?.slice(0, 5) },
    {
      label: t("streakPost.filterPeriod"),
      value: (r) => t(`streakPost.period.${getPeriodOfDay(r.post_time)}`),
    },
    { label: t("streakPost.fieldDuration"), value: (r) => r.duration },
    { label: t("common.description"), value: (r) => r.description || "" },
  ];

  const handleExport = async (format, rows = filtered, suffix = "") => {
    try {
      if (format === "csv")
        exportToCsv(rows, columns, `streak-posts${suffix}.csv`);
      else if (format === "excel")
        exportToExcel(rows, columns, `streak-posts${suffix}.xlsx`);
      else
        await exportToPdf(
          rows,
          columns,
          `streak-posts${suffix}.pdf`,
          t("streakPost.title"),
        );
      toast.success(t("csv.exportSuccess"));
    } catch {
      toast.error(t("toast.error"));
    }
  };

  const handleImport = async (file) => {
    try {
      const rows = await parseDataFile(file);
      const valid = rows
        .filter((r) => r.duration && r.date)
        .map((r) => ({
          duration: String(r.duration).trim(),
          post_date: String(r.date).trim(),
          post_time: String(r.time || "00:00").slice(0, 5),
          description: r.description
            ? String(r.description).trim() || null
            : null,
        }));
      if (!valid.length) {
        toast.error(t("csv.importError"));
        return;
      }
      await bulkCreate(valid);
      if (valid.length === rows.length) {
        toast.success(t("csv.importSuccess", { count: valid.length }));
      } else {
        toast.info(
          t("csv.importPartial", {
            count: valid.length,
            failed: rows.length - valid.length,
          }),
        );
      }
    } catch {
      toast.error(t("csv.importError"));
    }
  };

  const toggleSelectAll = () => {
    setSelected(
      selected.length === filtered.length ? [] : filtered.map((f) => f.id),
    );
  };

  const toggleDateSort = () =>
    setSort((s) => (s === "newest" ? "oldest" : "newest"));
  const toggleDurationSort = () =>
    setSort((s) => (s === "nameAsc" ? "nameDesc" : "nameAsc"));
  const SortIcon = ({ active, asc }) =>
    !active ? (
      <ArrowUpDown size={12} className="opacity-40" />
    ) : asc ? (
      <ArrowUp size={12} />
    ) : (
      <ArrowDown size={12} />
    );

  return (
    <div>
      <PageHeader
        title={t("streakPost.title")}
        subtitle={t("streakPost.subtitle")}
        // actions={
        //   <Button
        //     icon={Plus}
        //     onClick={() => {
        //       setEditing(null);
        //       setFormOpen(true);
        //     }}
        //   >
        //     {t("common.addNew")}
        //   </Button>
        // }
      />

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        sortOptions={sortOptions}
        onImport={handleImport}
        onExport={(format) => handleExport(format)}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        setEditing={setEditing}
        setFormOpen={setFormOpen}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-ink-soft)]">
            {t("streakPost.filterPeriod")}
          </span>
          <Select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="w-full"
          >
            <option value="">{t("streakPost.allPeriods")}</option>
            {PERIOD_ORDER.map((p) => (
              <option key={p} value={p}>
                {t(`streakPost.period.${p}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-[var(--color-ink-soft)]">
            {t("streakPost.dateRange")}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              aria-label={t("streakPost.from")}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full min-w-0"
            />
            <Input
              type="date"
              aria-label={t("streakPost.to")}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full min-w-0"
            />
          </div>
        </div>
      </Toolbar>

      {selected.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-4 py-3 rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] text-sm">
          <span className="text-[var(--color-primary)] font-medium">
            {t("common.rowsSelected", { count: selected.length })}
          </span>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              icon={Copy}
              onClick={() =>
                handleExport(
                  "csv",
                  items.filter((i) => selected.includes(i.id)),
                  "-selected",
                )
              }
            >
              {t("common.exportSelected")}
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setBulkDeleteOpen(true)}
            >
              {t("common.deleteSelected")}
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <>
          <div className="hidden md:block rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonTableRow key={i} cols={6} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={NotebookText}
          title={
            items.length === 0 ? t("streakPost.empty") : t("common.noResults")
          }
          action={
            items.length === 0 && (
              <Button
                icon={Plus}
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                {t("common.addNew")}
              </Button>
            )
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <>
          <div className="hidden md:block rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-ink-soft)]">
                    <th className="sticky left-0 z-10 bg-[var(--color-surface)] border-r border-[var(--color-border)] px-4 py-3 w-10">
                      <Checkbox
                        checked={
                          selected.length === filtered.length &&
                          filtered.length > 0
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-2 py-3 font-medium border-r border-[var(--color-border)]">
                      <button
                        type="button"
                        onClick={toggleDateSort}
                        className="inline-flex items-center gap-1 hover:text-[var(--color-ink)] transition-colors"
                      >
                        {t("common.date")} / {t("common.time")}
                        <SortIcon
                          active={sort === "newest" || sort === "oldest"}
                          asc={sort === "oldest"}
                        />
                      </button>
                    </th>
                    <th className="px-2 py-3 font-medium hidden sm:table-cell border-r border-[var(--color-border)]">
                      {t("streakPost.filterPeriod")}
                    </th>
                    <th className="px-2 py-3 font-medium border-r border-[var(--color-border)]">
                      <button
                        type="button"
                        onClick={toggleDurationSort}
                        className="inline-flex items-center gap-1 hover:text-[var(--color-ink)] transition-colors"
                      >
                        {t("streakPost.fieldDuration")}
                        <SortIcon
                          active={sort === "nameAsc" || sort === "nameDesc"}
                          asc={sort === "nameAsc"}
                        />
                      </button>
                    </th>
                    <th className="px-2 py-3 font-medium hidden md:table-cell border-r border-[var(--color-border)]">
                      {t("common.description")}
                    </th>
                    <th className="px-2 py-3 font-medium text-right pr-4">
                      {t("common.actions")}
                    </th>
                  </tr>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/40">
                    <th className="sticky left-0 z-10 bg-[var(--color-surface)] border-r border-[var(--color-border)] px-4 py-2" />
                    <th className="px-2 py-2 border-r border-[var(--color-border)]" />
                    <th className="px-2 py-2 hidden sm:table-cell border-r border-[var(--color-border)]" />
                    <th className="px-2 py-2 border-r border-[var(--color-border)]">
                      <Input
                        icon={SearchIcon}
                        value={colDuration}
                        onChange={(e) => setColDuration(e.target.value)}
                        placeholder={t("common.columnSearchPlaceholder", {
                          column: t("streakPost.fieldDuration"),
                        })}
                        className="!py-1.5 !text-xs"
                      />
                    </th>
                    <th className="px-2 py-2 hidden md:table-cell border-r border-[var(--color-border)]">
                      <Input
                        icon={SearchIcon}
                        value={colDescription}
                        onChange={(e) => setColDescription(e.target.value)}
                        placeholder={t("common.columnSearchPlaceholder", {
                          column: t("common.description"),
                        })}
                        className="!py-1.5 !text-xs"
                      />
                    </th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row) => {
                    const period = getPeriodOfDay(row.post_time);
                    return (
                      <tr
                        key={row.id}
                        className="group border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-2)]/60 transition-colors cursor-pointer"
                        onClick={() => setViewing(row)}
                      >
                        <td
                          className="sticky left-0 z-10 bg-[var(--color-surface)] group-hover:bg-[var(--color-surface-2)] transition-colors border-r border-[var(--color-border)] px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selected.includes(row.id)}
                            onChange={() =>
                              setSelected((prev) =>
                                prev.includes(row.id)
                                  ? prev.filter((id) => id !== row.id)
                                  : [...prev, row.id],
                              )
                            }
                          />
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-[var(--color-ink)] border-r border-[var(--color-border)]">
                          {formatDateOnly(row.post_date)}{" "}
                          <span className="tabular text-[var(--color-ink-soft)]">
                            · {row.post_time?.slice(0, 5)}
                          </span>
                        </td>
                        <td className="px-2 py-3 hidden sm:table-cell border-r border-[var(--color-border)]">
                          <Badge tone={PERIOD_TONE[period]}>
                            {t(`streakPost.period.${period}`)}
                          </Badge>
                        </td>
                        <td className="px-2 py-3 max-w-[10rem]  text-[var(--color-ink)] font-medium border-r border-[var(--color-border)]">
                          {row.duration}
                        </td>
                        <td className="px-2 py-3 hidden md:table-cell max-w-xs  text-[var(--color-ink-soft)] border-r border-[var(--color-border)]">
                          {row.description}
                        </td>
                        <td
                          className="px-2 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5 pr-2">
                            <IconButton
                              tone="info"
                              icon={Eye}
                              label={t("common.view")}
                              onClick={() => setViewing(row)}
                            />
                            <IconButton
                              tone="primary"
                              icon={Pencil}
                              label={t("common.edit")}
                              onClick={() => {
                                setEditing(row);
                                setFormOpen(true);
                              }}
                            />
                            <IconButton
                              tone="danger"
                              icon={Trash2}
                              label={t("common.delete")}
                              onClick={() => setDeleting(row)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </div>

          {/* Mobile: cards instead of a cramped datatable — same data, same actions. */}
          <div className="md:hidden flex flex-col gap-3">
            {paginated.map((row) => {
              const period = getPeriodOfDay(row.post_time);
              const isSelected = selected.includes(row.id);
              return (
                <div
                  key={row.id}
                  onClick={() => setViewing(row)}
                  className={`stagger-item rounded-[var(--radius-card)] border bg-[var(--color-surface)] shadow-[var(--shadow-card)] p-4 flex flex-col gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "border-[var(--color-primary)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="pt-0.5"
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() =>
                            setSelected((prev) =>
                              prev.includes(row.id)
                                ? prev.filter((id) => id !== row.id)
                                : [...prev, row.id],
                            )
                          }
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--color-ink)]">
                          {row.duration}
                        </p>
                        <p className="text-[var(--color-ink-soft)] tabular mt-0.5 text-sm">
                          {formatDateOnly(row.post_date)} ·{" "}
                          {row.post_time?.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                    <Badge tone={PERIOD_TONE[period]} className="shrink-0">
                      {t(`streakPost.period.${period}`)}
                    </Badge>
                  </div>
                  {row.description && (
                    <p className="text-[var(--color-ink-soft)]">
                      {row.description}
                    </p>
                  )}
                  <div
                    className="flex items-center justify-end gap-1.5 pt-2 border-t border-[var(--color-border)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      size={18}
                      tone="info"
                      icon={Eye}
                      label={t("common.view")}
                      onClick={() => setViewing(row)}
                    />
                    <IconButton
                      size={18}
                      tone="primary"
                      icon={Pencil}
                      label={t("common.edit")}
                      onClick={() => {
                        setEditing(row);
                        setFormOpen(true);
                      }}
                    />
                    <IconButton
                      size={18}
                      tone="danger"
                      icon={Trash2}
                      label={t("common.delete")}
                      onClick={() => setDeleting(row)}
                    />
                  </div>
                </div>
              );
            })}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                total={filtered.length}
                onPageChange={setPage}
              />
            </div>
          </div>
        </>
      )}

      <StreakPostForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <StreakPostView
        open={!!viewing}
        onClose={() => setViewing(null)}
        post={viewing}
        onEdit={(row) => {
          setEditing(row);
          setFormOpen(true);
        }}
        onDelete={(row) => setDeleting(row)}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        body={
          deleting
            ? `${t("common.deleteConfirmBody")} (${deleting.duration})`
            : ""
        }
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        body={t("common.deleteConfirmBody")}
      />
    </div>
  );
}
