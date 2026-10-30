import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  NotebookText,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search as SearchIcon,
} from "lucide-react";
import { useLang } from "../context/LangContext";
import { getLocale } from "../i18n";
import { useToast } from "../context/ToastContext";
import { useStreakPosts } from "../hooks/useStreakPosts";
import PageHeader from "../components/ui/PageHeader";
import Toolbar from "../components/ui/Toolbar";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import IconButton from "../components/ui/IconButton";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import Fab from "../components/ui/Fab";
import SwipeRow from "../components/SwipeRow";
import StreakPostForm from "../components/StreakPostForm";
import { SkeletonTableRow, SkeletonCard } from "../components/ui/Skeleton";
import { formatDateOnly, getPeriodOfDay, PERIOD_ORDER } from "../utils/date";
import { PERIOD_TONE } from "../utils/period";

const PAGE_SIZE = 20;

/** Chuyển chuỗi thành dạng chữ thường để so khớp tìm kiếm. */
const norm = (s) => String(s || "").toLowerCase();

export default function StreakPosts() {
  const { t } = useLang();
  const toast = useToast();
  const {
    items,
    loading,
    error,
    create,
    update,
    remove,
  } = useStreakPosts();

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
  const [deleting, setDeleting] = useState(null);

  const sortOptions = [
    { value: "newest", label: t("common.newest") },
    { value: "oldest", label: t("common.oldest") },
    { value: "nameAsc", label: t("common.nameAsc") },
    { value: "nameDesc", label: t("common.nameDesc") },
  ];

  const filtered = useMemo(() => {
    const q = norm(search);
    const cd = norm(colDuration);
    const cs = norm(colDescription);
    const list = items.filter((it) => {
      if (
        q &&
        !norm(it.duration).includes(q) &&
        !norm(it.description).includes(q)
      )
        return false;
      if (periodFilter && getPeriodOfDay(it.post_time) !== periodFilter)
        return false;
      if (fromDate && it.post_date < fromDate) return false;
      if (toDate && it.post_date > toDate) return false;
      if (cd && !norm(it.duration).includes(cd)) return false;
      if (cs && !norm(it.description).includes(cs)) return false;
      return true;
    });
    // Chuỗi YYYY-MM-DD và HH:mm so sánh theo thứ tự chữ cái chính là thứ tự thời gian.
    const stamp = (x) => `${x.post_date} ${x.post_time}`;
    return list.sort((a, b) => {
      if (sort === "newest") return stamp(b).localeCompare(stamp(a));
      if (sort === "oldest") return stamp(a).localeCompare(stamp(b));
      if (sort === "nameAsc") return a.duration.localeCompare(b.duration, getLocale());
      return b.duration.localeCompare(a.duration, getLocale());
    });
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

  const hasActiveFilters = Boolean(
    search ||
    sort !== "newest" ||
    periodFilter ||
    fromDate ||
    toDate ||
    colDuration ||
    colDescription,
  );

  // Mọi thay đổi bộ lọc đều quay về trang 1 để danh sách không bị trống.
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

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) await update(editing.id, payload);
      else await create(payload);
      toast.success(t(editing ? "toast.updated" : "toast.saved"));
    } catch {
      toast.error(t("toast.error"));
      throw new Error("save-failed");
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleting.id);
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("toast.error"));
    }
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
      />

      <Toolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        sortOptions={sortOptions}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[var(--md-on-surface-variant)] px-1">
            {t("streakPost.filterPeriod")}
          </span>
          <Select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
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
          <span className="text-xs font-semibold text-[var(--md-on-surface-variant)] px-1">
            {t("streakPost.dateRange")}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              aria-label={t("streakPost.from")}
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              className="min-w-0"
            />
            <Input
              type="date"
              aria-label={t("streakPost.to")}
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="min-w-0"
            />
          </div>
        </div>
      </Toolbar>

      {error && (
        <p className="mb-4 text-sm font-medium text-[var(--md-error)]">
          {t("toast.loadError")}
        </p>
      )}

      {loading && (
        <>
          <div className="hidden md:block rounded-[var(--radius-card)] bg-[var(--md-surface-container-low)] overflow-hidden">
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
              <Button icon={Plus} onClick={openAdd}>
                {t("common.addNew")}
              </Button>
            )
          }
        />
      )}

      {!loading && filtered.length > 0 && (
        <>
          {/* Desktop và tablet: bảng dữ liệu */}
          <div className="page-enter hidden md:block rounded-[var(--radius-card)] bg-[var(--md-surface-container-low)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--md-outline-variant)] text-left text-xs font-semibold text-[var(--md-on-surface-variant)]">
                    <th className="px-2 py-3 font-semibold">
                      <button
                        type="button"
                        onClick={toggleDateSort}
                        className="inline-flex items-center gap-1 hover:text-[var(--md-on-surface)] transition-colors"
                      >
                        {t("common.date")} / {t("common.time")}
                        <SortIcon
                          active={sort === "newest" || sort === "oldest"}
                          asc={sort === "oldest"}
                        />
                      </button>
                    </th>
                    <th className="px-2 py-3 font-semibold">
                      {t("streakPost.filterPeriod")}
                    </th>
                    <th className="px-2 py-3 font-semibold">
                      <button
                        type="button"
                        onClick={toggleDurationSort}
                        className="inline-flex items-center gap-1 hover:text-[var(--md-on-surface)] transition-colors"
                      >
                        {t("streakPost.fieldDuration")}
                        <SortIcon
                          active={sort === "nameAsc" || sort === "nameDesc"}
                          asc={sort === "nameAsc"}
                        />
                      </button>
                    </th>
                    <th className="px-2 py-3 font-semibold">
                      {t("common.description")}
                    </th>
                    <th className="px-2 py-3 font-semibold text-right pr-4">
                      {t("common.actions")}
                    </th>
                  </tr>
                  <tr className="border-b border-[var(--md-outline-variant)] bg-[var(--md-surface-container)]">
                    <th className="px-2 py-2" />
                    <th className="px-2 py-2" />
                    <th className="px-2 py-2">
                      <Input
                        icon={SearchIcon}
                        value={colDuration}
                        onChange={(e) => setColDuration(e.target.value)}
                        placeholder={t("common.columnSearchPlaceholder", {
                          column: t("streakPost.fieldDuration"),
                        })}
                        className="!py-2 !text-xs font-normal"
                      />
                    </th>
                    <th className="px-2 py-2">
                      <Input
                        icon={SearchIcon}
                        value={colDescription}
                        onChange={(e) => setColDescription(e.target.value)}
                        placeholder={t("common.columnSearchPlaceholder", {
                          column: t("common.description"),
                        })}
                        className="!py-2 !text-xs font-normal"
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
                        className="group border-b border-[var(--md-outline-variant)] last:border-0 transition-colors hover:bg-[color-mix(in_oklab,var(--md-primary)_8%,transparent)]"
                      >
                        <td className="px-2 py-3 whitespace-nowrap text-[var(--md-on-surface)]">
                          {formatDateOnly(row.post_date)}{" "}
                          <span className="tabular text-[var(--md-on-surface-variant)]">
                            · {row.post_time?.slice(0, 5)}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <Badge tone={PERIOD_TONE[period]}>
                            {t(`streakPost.period.${period}`)}
                          </Badge>
                        </td>
                        <td className="px-2 py-3 max-w-[12rem] text-[var(--md-on-surface)] font-semibold break-words">
                          {row.duration}
                        </td>
                        <td className="px-2 py-3 max-w-xs text-[var(--md-on-surface-variant)] break-words">
                          {row.description}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center justify-end gap-1.5 pr-2 relative z-0">
                            <IconButton
                              tone="primary"
                              icon={Pencil}
                              label={t("common.edit")}
                              onClick={() => openEdit(row)}
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

          {/* Mobile: thẻ có thể vuốt. Vuốt phải là sửa, vuốt trái là xóa. */}
          <div className="md:hidden flex flex-col gap-3">
            <p className="text-xs text-left text-[var(--md-on-surface-variant)] px-1">
              {t("common.swipeHint")}
            </p>
            {paginated.map((row) => {
              const period = getPeriodOfDay(row.post_time);
              return (
                <SwipeRow
                  key={row.id}
                  onSwipeRight={() => openEdit(row)}
                  onSwipeLeft={() => setDeleting(row)}
                  className="stagger-item"
                >
                  <div className="rounded-[var(--radius-card)] p-4 flex flex-col gap-3 bg-[var(--md-surface-container-low)] text-[var(--md-on-surface)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="font-bold text-base break-words">
                            {row.duration}
                          </p>
                          <p className="opacity-75 tabular mt-0.5 text-sm">
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
                      <p className="text-sm opacity-80 line-clamp-3 break-words">
                        {row.description}
                      </p>
                    )}
                  </div>
                </SwipeRow>
              );
            })}
            <div className="rounded-[var(--radius-card)] bg-[var(--md-surface-container-low)] overflow-hidden">
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

      <Fab icon={Plus} label={t("common.addNew")} onClick={openAdd} />
    </div>
  );
}
