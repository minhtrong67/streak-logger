import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { Clock, NotebookText, CalendarDays, TrendingUp, Sun, ChevronLeft, ChevronRight, FileDown } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useToast } from '../context/ToastContext'
import { useTimeStreak } from '../hooks/useTimeStreak'
import { useStreakPosts } from '../hooks/useStreakPosts'
import { useNow } from '../hooks/useNow'
import { computeElapsedParts, formatDateOnly, getPeriodOfDay } from '../utils/date'
import { PERIOD_HEX } from '../utils/period'
import { RANGES, buildMetrics, buildPeriodCounts, buildSeries, filterPostsInRange, getRange } from '../utils/stats'
import { POST_COLUMNS } from '../utils/postExport'
import { timestampSuffix } from '../utils/exportData'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonStatCard } from '../components/ui/Skeleton'

/** Thẻ số liệu nền màu nổi bật (gradient violet và các màu bổ trợ). */
const CARD_STYLES = [
  'from-violet-600 to-violet-500',
  'from-indigo-600 to-indigo-500',
  'from-purple-600 to-fuchsia-500',
  'from-sky-600 to-sky-500',
  'from-emerald-600 to-emerald-500',
]

function StatCard({ icon: Icon, label, value, sub, tone = 0, delay = 0 }) {
  return (
    <div
      className={`stagger-item card-hover group rounded-[var(--radius-card)] bg-gradient-to-br ${CARD_STYLES[tone % CARD_STYLES.length]} text-white shadow-[var(--shadow-card)] p-4 sm:p-5 flex items-start gap-3`}
      style={{ '--stagger-delay': `${delay}ms` }}
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-white/85">{label}</p>
        <p className="text-xl font-semibold tabular truncate">{value}</p>
        {sub && <p className="text-xs text-white/80 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-[var(--color-ink)] mb-4">{title}</h3>
      {children}
    </div>
  )
}

const tooltipProps = {
  contentStyle: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: 'var(--color-ink)' },
  itemStyle: { color: 'var(--color-ink)' },
  cursor: { fill: 'var(--color-primary-soft)', opacity: 0.5 },
}

const legendProps = {
  wrapperStyle: { fontSize: 12, color: 'var(--color-ink-soft)', paddingTop: 8 },
  iconType: 'circle',
  iconSize: 8,
}

const skipZero = (v) => (v === 0 ? '' : v)

/** Khoảng cách nhãn trục X theo mức thống kê để không chen chúc trên mobile. */
const X_INTERVAL = { day: 2, week: 0, month: 1, year: 0 }

/** Nhãn số liệu ngoài mỗi miếng của biểu đồ tròn, màu theo giao diện. */
function renderPieLabel({ cx, cy, midAngle, outerRadius, percent, count }) {
  if (!count) return null
  const RAD = Math.PI / 180
  const r = outerRadius + 18
  const x = cx + r * Math.cos(-midAngle * RAD)
  const y = cy + r * Math.sin(-midAngle * RAD)
  return (
    <text x={x} y={y} fill="var(--color-ink)" fontSize={12} fontWeight={600} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${count} (${Math.round(percent * 100)}%)`}
    </text>
  )
}

export default function Statistics() {
  const { t } = useLang()
  const toast = useToast()
  const now = useNow(60000)
  const { streak, loading: streakLoading } = useTimeStreak()
  const { items: posts, loading: postsLoading } = useStreakPosts()
  const [rangeKey, setRangeKey] = useState('month') // mặc định theo tháng
  const [offset, setOffset] = useState(0)
  const [exporting, setExporting] = useState(false)

  const range = useMemo(() => getRange(rangeKey, now, offset), [rangeKey, now, offset])
  const rangePosts = useMemo(() => filterPostsInRange(posts, range), [posts, range])
  const series = useMemo(() => buildSeries(rangePosts, range), [rangePosts, range])
  const periodCounts = useMemo(() => buildPeriodCounts(rangePosts), [rangePosts])
  const metrics = useMemo(() => buildMetrics(rangePosts, periodCounts), [rangePosts, periodCounts])

  const streakDays = streak && new Date(streak.start_at) <= now ? computeElapsedParts(streak.start_at, now).totalDays : null

  const loading = streakLoading || postsLoading
  const hasData = !!streak || posts.length > 0
  const rangeLabels = { day: t('stats.byDay'), week: t('stats.byWeek'), month: t('stats.byMonth'), year: t('stats.byYear') }
  const pieData = periodCounts.filter((p) => p.count > 0)

  const changeRange = (key) => {
    setRangeKey(key)
    setOffset(0)
  }

  const handleExportReport = async () => {
    setExporting(true)
    try {
      const { exportStatsReport } = await import('../utils/report')
      const rows = [...rangePosts].sort((a, b) => `${b.post_date} ${b.post_time}`.localeCompare(`${a.post_date} ${a.post_time}`))
      await exportStatsReport({
        rangeKey,
        rangeLabel: range.label,
        cards: [
          { label: 'Streak hiện tại', value: streakDays !== null ? `${streakDays} ngày` : 'Chưa thiết lập' },
          { label: 'Tổng số mục', value: String(metrics.total) },
          { label: 'Ngày hoạt động', value: String(metrics.activeDays) },
          { label: 'Buổi năng động nhất', value: metrics.busiest ? metrics.busiest.name : '-' },
        ],
        series,
        periodCounts,
        rows,
        columns: POST_COLUMNS.filter((c) => c.key !== 'period').map((c) => ({ label: t(c.labelKey), value: (r) => c.get(r, t) })),
        filename: `streak-logger-bao-cao-${rangeKey}-${timestampSuffix()}.pdf`,
      })
      toast.success(t('stats.reportDone'))
    } catch {
      toast.error(t('csv.exportError'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={t('stats.title')}
        subtitle={t('stats.subtitle')}
        actions={
          <Button className='w-full' icon={FileDown} onClick={handleExportReport} loading={exporting} disabled={loading || !hasData}>
            {t('stats.exportReport')}
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      ) : !hasData ? (
        <EmptyState icon={NotebookText} title={t('stats.noData')} />
      ) : (
        <div className="flex flex-col gap-4 sm:gap-5">
          {/* Chọn mức thống kê và chuyển kỳ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex rounded-[var(--radius-control)] bg-[var(--color-surface-2)] p-1 gap-1 w-full sm:w-auto">
              {RANGES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => changeRange(g)}
                  aria-pressed={rangeKey === g}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-[calc(var(--radius-control)-4px)] text-sm font-medium transition-all duration-150 active:scale-95 ${
                    rangeKey === g ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-sm' : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {rangeLabels[g]}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => setOffset((o) => o - 1)}
                aria-label={t('stats.prev')}
                className="w-9 h-9 rounded-[var(--radius-control)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] transition-colors active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setOffset(0)}
                className="min-w-[10rem] px-3 py-2 text-sm font-medium text-center text-[var(--color-ink)] rounded-[var(--radius-control)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                {range.label}
              </button>
              <button
                type="button"
                onClick={() => setOffset((o) => o + 1)}
                disabled={offset >= 0}
                aria-label={t('stats.next')}
                className="w-9 h-9 rounded-[var(--radius-control)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] transition-colors active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Thẻ số liệu */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard tone={0} icon={Clock} label={t('stats.currentStreak')} value={streakDays !== null ? `${streakDays} ${t('stats.days')}` : t('stats.noStreakYet')} sub={streak?.title} delay={0} />
            <StatCard tone={1} icon={NotebookText} label={t('stats.totalPosts')} value={metrics.total} delay={40} />
            <StatCard tone={2} icon={CalendarDays} label={t('stats.activeDays')} value={metrics.activeDays} delay={80} />
            <StatCard tone={3} icon={TrendingUp} label={t('stats.average')} value={metrics.average} sub={t('stats.entries')} delay={120} />
            <div className="col-span-2 lg:col-span-1">
              <StatCard tone={4} icon={Sun} label={t('stats.mostActivePeriod')} value={metrics.busiest ? metrics.busiest.name : '-'} sub={metrics.busiest ? `${metrics.busiest.count} ${t('stats.entries')}` : ''} delay={160} />
            </div>
          </div>

          {/* Biểu đồ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="lg:col-span-2">
              <ChartCard title={`${t('stats.postsOverTime')} (${range.label})`}>
                {rangePosts.length === 0 ? (
                  <p className="text-sm text-[var(--color-ink-soft)] py-16 text-center">{t('stats.noDataInRange')}</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={series} margin={{ top: 20, right: 4, left: -12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} interval={X_INTERVAL[rangeKey]} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }} axisLine={false} tickLine={false} width={36} />
                      <Tooltip {...tooltipProps} />
                      <Legend {...legendProps} />
                      <Bar dataKey="count" name={t('stats.totalPosts')} fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={28}>
                        <LabelList dataKey="count" position="top" formatter={skipZero} style={{ fontSize: 11, fill: 'var(--color-ink)', fontWeight: 600 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            <ChartCard title={t('stats.postsByPeriod')}>
              {rangePosts.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-soft)] py-16 text-center">{t('stats.noDataInRange')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <Pie data={pieData} dataKey="count" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={2} label={renderPieLabel} labelLine={{ stroke: 'var(--color-divider)' }}>
                      {pieData.map((p) => (
                        <Cell key={p.key} fill={PERIOD_HEX[p.key]} stroke="var(--color-surface)" />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipProps} cursor={false} />
                    <Legend {...legendProps} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Bảng nhỏ liệt kê nhật ký mới nhất trong kỳ để người dùng đối chiếu với số liệu */}
          {rangePosts.length > 0 && (
            <ChartCard title={`${t('streakPost.title')} (${range.label})`}>
              <ul className="divide-y divide-[var(--color-border)]">
                {[...rangePosts]
                  .sort((a, b) => `${b.post_date} ${b.post_time}`.localeCompare(`${a.post_date} ${a.post_time}`))
                  .slice(0, 5)
                  .map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="font-medium text-[var(--color-ink)] truncate">{p.duration}</span>
                      <span className="tabular text-xs text-[var(--color-ink-soft)] shrink-0">
                        {formatDateOnly(p.post_date)} · {p.post_time} · {t(`streakPost.period.${getPeriodOfDay(p.post_time)}`)}
                      </span>
                    </li>
                  ))}
              </ul>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  )
}
