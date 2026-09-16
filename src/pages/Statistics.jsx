import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Clock, NotebookText, Sun, CalendarDays } from "lucide-react";
import { useLang } from "../context/LangContext";
import { useTimeStreak } from "../hooks/useTimeStreak";
import { useStreakPosts } from "../hooks/useStreakPosts";
import { useNow } from "../hooks/useNow";
import {
  computeElapsedParts,
  getPeriodOfDay,
  PERIOD_ORDER,
  getWeekdayShort,
  getMonthShort,
  getWeekStart,
} from "../utils/date";
import { PERIOD_HEX } from "../utils/period";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonStatCard } from "../components/ui/Skeleton";

const PERIOD_COLORS = PERIOD_HEX;
const GRANULARITIES = ["day", "week", "month", "year"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Buckets posts into a time series for the vertical bar chart, per the
 * selected granularity. Always ends "now" and looks back a fixed window
 * (14 days / 8 weeks / 12 months / 5 years) so the chart shape is stable
 * regardless of how much history exists. */
function buildTimeSeries(posts, granularity, now, lang) {
  if (granularity === "day") {
    const out = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      out.push({
        label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
        count: posts.filter((p) => p.post_date === key).length,
      });
    }
    return out;
  }
  if (granularity === "week") {
    const out = [];
    const currentWeekStart = getWeekStart(now);
    for (let i = 7; i >= 0; i--) {
      const start = new Date(currentWeekStart);
      start.setDate(start.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const count = posts.filter((p) => {
        const d = new Date(p.post_date);
        return d >= start && d <= end;
      }).length;
      out.push({
        label: `${pad(start.getDate())}/${pad(start.getMonth() + 1)}`,
        count,
      });
    }
    return out;
  }
  if (granularity === "year") {
    const out = [];
    const curY = now.getFullYear();
    for (let i = 4; i >= 0; i--) {
      const y = curY - i;
      out.push({
        label: String(y),
        count: posts.filter((p) => new Date(p.post_date).getFullYear() === y)
          .length,
      });
    }
    return out;
  }
  // month (default)
  const out = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = posts.filter((p) => {
      const pd = new Date(p.post_date);
      return (
        pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth()
      );
    }).length;
    out.push({ label: getMonthShort(d.getMonth(), lang), count });
  }
  return out;
}

/** Monday-first weekday counts across all history, for the horizontal bar chart. */
function buildWeekdayCounts(posts, lang) {
  const counts = new Array(7).fill(0);
  posts.forEach((p) => {
    counts[new Date(p.post_date).getDay()] += 1;
  });
  return [1, 2, 3, 4, 5, 6, 0].map((i) => ({
    label: getWeekdayShort(i, lang),
    count: counts[i],
  }));
}

function StatCard({ icon: Icon, label, value, sub, delay = 0 }) {
  return (
    <div
      className="stagger-item card-hover group rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-5 flex items-start gap-3.5"
      style={{ "--stagger-delay": `${delay}ms` }}
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-ink-soft)]">{label}</p>
        <p className="text-xl font-semibold text-[var(--color-ink)] tabular truncate">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-[var(--color-ink-soft)] mt-0.5 truncate">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, actions, children }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">
          {title}
        </h3>
        {actions}
      </div>
      {children}
    </div>
  );
}

function tooltipStyle() {
  return {
    contentStyle: {
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: 12,
      fontSize: 12,
    },
    labelStyle: { color: "var(--color-ink)" },
  };
}

function legendStyle(extra) {
  return {
    wrapperStyle: {
      fontSize: 12,
      color: "var(--color-ink-soft)",
      paddingTop: 8,
      ...extra,
    },
    iconType: "circle",
    iconSize: 8,
  };
}

/** Value labels rendered directly on bars/slices — mobile users can't
 * hover to see the tooltip, so the numbers need to be visible at rest. */
function countLabelStyle(extra) {
  return { fontSize: 11, fill: "var(--color-ink)", fontWeight: 600, ...extra };
}

function skipZero(value) {
  return value === 0 ? "" : value;
}

/** Custom pie-slice label so the text color follows the current theme
 * (recharts' default label fill is plain black, unreadable in dark mode). */
function renderPieLabel({ cx, cy, midAngle, outerRadius, count }) {
  if (!count) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 16;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="var(--color-ink)"
      fontSize={12}
      fontWeight={600}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {count}
    </text>
  );
}

export default function Statistics() {
  const { t, lang } = useLang();
  const now = useNow(60000);
  const { streak, loading: streakLoading } = useTimeStreak();
  const { items: posts, loading: postsLoading } = useStreakPosts();
  const [granularity, setGranularity] = useState("month");

  const streakParts =
    streak && new Date(streak.start_at) <= now
      ? computeElapsedParts(streak.start_at, now)
      : null;
  const streakDays = streakParts
    ? streakParts.years * 365 + streakParts.months * 30 + streakParts.days
    : null;

  const periodCounts = useMemo(() => {
    const map = { morning: 0, noon: 0, afternoon: 0, evening: 0 };
    posts.forEach((p) => {
      map[getPeriodOfDay(p.post_time)] += 1;
    });
    return PERIOD_ORDER.map((p) => ({
      key: p,
      name: t(`streakPost.period.${p}`),
      count: map[p],
    }));
  }, [posts, t]);

  const mostActivePeriod = useMemo(() => {
    const withData = periodCounts.filter((p) => p.count > 0);
    if (!withData.length) return null;
    return [...withData].sort((a, b) => b.count - a.count)[0];
  }, [periodCounts]);

  const activeDays = useMemo(
    () => new Set(posts.map((p) => p.post_date)).size,
    [posts],
  );

  const entriesThisMonth = useMemo(() => {
    const y = now.getFullYear();
    const m = now.getMonth();
    return posts.filter((p) => {
      const d = new Date(p.post_date);
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;
  }, [posts, now]);

  const timeSeries = useMemo(
    () => buildTimeSeries(posts, granularity, now, lang),
    [posts, granularity, now, lang],
  );
  const weekdayCounts = useMemo(
    () => buildWeekdayCounts(posts, lang),
    [posts, lang],
  );

  const loading = streakLoading || postsLoading;
  const hasData = !!streak || posts.length > 0;

  const granularityLabels = {
    day: t("stats.byDay"),
    week: t("stats.byWeek"),
    month: t("stats.byMonth"),
    year: t("stats.byYear"),
  };
  const rangeLabels = {
    day: t("stats.rangeDay"),
    week: t("stats.rangeWeek"),
    month: t("stats.rangeMonth"),
    year: t("stats.rangeYear"),
  };

  return (
    <div>
      <PageHeader title={t("stats.title")} subtitle={t("stats.subtitle")} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      ) : !hasData ? (
        <EmptyState icon={NotebookText} title={t("stats.noData")} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Clock}
              label={t("stats.currentStreak")}
              value={
                streakDays !== null
                  ? `${streakDays} ${t("timeStreak.days")}`
                  : t("stats.noStreakYet")
              }
              sub={streak?.title}
              delay={0}
            />
            <StatCard
              icon={NotebookText}
              label={t("stats.totalPosts")}
              value={posts.length}
              delay={40}
            />
            <StatCard
              icon={CalendarDays}
              label={t("stats.entriesThisMonth")}
              value={entriesThisMonth}
              delay={80}
            />
            <StatCard
              icon={CalendarDays}
              label={t("stats.activeDays")}
              value={activeDays}
              delay={120}
            />
          </div>
          <StatCard
            icon={Sun}
            label={t("stats.mostActivePeriod")}
            value={mostActivePeriod ? mostActivePeriod.name : "—"}
            sub={
              mostActivePeriod
                ? `${mostActivePeriod.count} ${t("stats.entries")}`
                : ""
            }
            delay={160}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <ChartCard
                title={`${t("stats.postsOverTime")} — ${rangeLabels[granularity]}`}
                actions={
                  <div className="inline-flex rounded-[var(--radius-control)] bg-[var(--color-surface-2)] p-1 gap-1">
                    {GRANULARITIES.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGranularity(g)}
                        aria-pressed={granularity === g}
                        className={`px-3 py-1.5 rounded-[calc(var(--radius-control)-4px)] text-xs font-medium transition-all duration-150 active:scale-95 ${
                          granularity === g
                            ? "bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-sm"
                            : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {granularityLabels[g]}
                      </button>
                    ))}
                  </div>
                }
              >
                {posts.length === 0 ? (
                  <p className="text-sm text-[var(--color-ink-soft)] py-8 text-center">
                    {t("stats.noData")}
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={284}>
                    <BarChart data={timeSeries} margin={{ top: 16 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
                        interval={granularity === "day" ? 1 : 0}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                      />
                      <Tooltip {...tooltipStyle()} />
                      <Legend {...legendStyle()} />
                      <Bar
                        dataKey="count"
                        name={t("stats.totalPosts")}
                        fill="var(--color-primary)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={28}
                      >
                        <LabelList
                          dataKey="count"
                          position="top"
                          formatter={skipZero}
                          style={countLabelStyle()}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
            <ChartCard title={t("stats.postsByPeriod")}>
              {posts.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-soft)] py-8 text-center">
                  {t("stats.noData")}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={284}>
                  <PieChart>
                    <Pie
                      data={periodCounts}
                      dataKey="count"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={2}
                      label={renderPieLabel}
                      labelLine={{ stroke: "var(--color-divider)" }}
                    >
                      {periodCounts.map((p) => (
                        <Cell key={p.key} fill={PERIOD_COLORS[p.key]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle()} />
                    <Legend {...legendStyle()} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {posts.length > 0 && (
            <ChartCard title={t("stats.entriesByWeekday")}>
              <ResponsiveContainer width="100%" height={244}>
                <BarChart
                  data={weekdayCounts}
                  layout="vertical"
                  margin={{ left: 8, right: 28 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 12, fill: "var(--color-ink)" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip {...tooltipStyle()} />
                  <Legend {...legendStyle()} />
                  <Bar
                    dataKey="count"
                    name={t("stats.totalPosts")}
                    fill="var(--color-teal)"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={20}
                  >
                    <LabelList
                      dataKey="count"
                      position="right"
                      formatter={skipZero}
                      style={countLabelStyle()}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}
