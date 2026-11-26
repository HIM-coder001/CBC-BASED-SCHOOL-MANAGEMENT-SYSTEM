import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
// Lucide icons (new)
import {
  Users, GraduationCap, BookOpen, TrendingUp, TrendingDown,
  RefreshCw, Download, Printer, AlertTriangle, ShieldAlert,
  DollarSign, ClipboardList, CalendarX, BarChart2, Minus,
} from 'lucide-react'

// API additions
import { analyticsAPI, classAPI, feeAPI, disciplineAPI, academicAPI } from '../api'

// Recharts additions
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, ReferenceLine,
} from 'recharts'

// UI additions (EmptyState, Skeleton, SkeletonTable already in ui.jsx)
import { Card, PageHeader, StatCard, Alert, Select, Button, Skeleton, SkeletonTable, EmptyState } from '../components/ui'

const GRADE_COLORS = { EE: '#22c55e', ME: '#3b82f6', AE: '#f59e0b', BE: '#ef4444' }
const ATT_COLORS   = { PRESENT: '#22c55e', ABSENT: '#ef4444', LATE: '#f59e0b', EXCUSED: '#6366f1' }

const TERMS = [
  { value: '', label: 'All Terms' },
  { value: 'Term 1', label: 'Term 1' },
  { value: 'Term 2', label: 'Term 2' },
  { value: 'Term 3', label: 'Term 3' },
]

function getPrevTermParams(term, year) {
  // Returns { term, year } for the term immediately before the given one.
  // Returns null when "All Terms" is selected (no trend to show).
  if (!term) return null
  const y = Number(year) || new Date().getFullYear()
  if (term === 'Term 1') return { term: 'Term 3', year: y - 1 }
  if (term === 'Term 2') return { term: 'Term 1', year: y }
  if (term === 'Term 3') return { term: 'Term 2', year: y }
  return null
}

function useChartHeight(defaultH = 200, mobileH = 160) {
  const [h, setH] = useState(defaultH)
  useEffect(() => {
    const update = () => setH(window.innerWidth < 640 ? mobileH : defaultH)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [defaultH, mobileH])
  return h
}

function TrendBadge({ current, previous }) {
  if (current == null || previous == null || previous === 0) {
    return <span className="text-xs text-slate-400 flex items-center gap-0.5"><Minus className="w-3 h-3" /> N/A</span>
  }
  const delta = +(current - previous).toFixed(1)
  if (delta > 0) {
    return (
      <span className="text-xs text-emerald-600 flex items-center gap-0.5">
        <TrendingUp className="w-3 h-3" />
        +{delta}pp vs prev term
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="text-xs text-red-500 flex items-center gap-0.5">
        <TrendingDown className="w-3 h-3" />
        {delta}pp vs prev term
      </span>
    )
  }
  return <span className="text-xs text-slate-400 flex items-center gap-0.5"><Minus className="w-3 h-3" /> No change</span>
}

function GradePieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const total = payload[0].payload?.total
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2 text-sm">
      <p className="font-semibold text-slate-700">{name}</p>
      <p className="text-slate-500">Count: <span className="font-medium text-slate-800">{value}</span></p>
      {total > 0 && (
        <p className="text-slate-500">
          Share: <span className="font-medium text-slate-800">{Math.round((value / total) * 100)}%</span>
        </p>
      )}
    </div>
  )
}

function exportCSV(stats, defaultersCount, disciplineCount, term, year) {
  if (!stats) return
  
  const termLabel = term || 'all-terms'
  const yearLabel = year || new Date().getFullYear()
  const timestamp = new Date().toLocaleString('en-KE')
  
  let csv = 'Analytics Report\n'
  csv += `Generated: ${timestamp}\n`
  csv += `Term: ${termLabel}\n`
  csv += `Year: ${yearLabel}\n\n`
  
  // KPI Section
  csv += 'Key Performance Indicators\n'
  csv += 'Metric,Value\n'
  csv += `Students,${stats.studentCount ?? 0}\n`
  csv += `Teachers,${stats.teacherCount ?? 0}\n`
  csv += `Classes,${stats.classCount ?? 0}\n`
  csv += `Attendance Rate,${stats.attendanceRate ?? 'N/A'}%\n`
  csv += `Fee Defaulters,${defaultersCount ?? 'N/A'}\n`
  csv += `Discipline Incidents,${disciplineCount ?? 'N/A'}\n\n`
  
  // Grade Distribution
  csv += 'Grade Distribution\n'
  csv += 'Grade,Count\n'
  if (stats.gradeDist) {
    Object.entries(stats.gradeDist).forEach(([grade, count]) => {
      csv += `${grade},${count}\n`
    })
  }
  csv += '\n'
  
  // Attendance Breakdown
  csv += 'Attendance Breakdown\n'
  csv += 'Status,Count\n'
  if (stats.attDist) {
    Object.entries(stats.attDist).forEach(([status, count]) => {
      csv += `${status},${count}\n`
    })
  }
  csv += '\n'
  
  // Fee Summary
  csv += 'Fee Collection Summary\n'
  csv += 'Status,Amount\n'
  if (stats.feeTotals) {
    csv += `Collected,KES ${stats.feeTotals.collected ?? 0}\n`
    csv += `Pending,KES ${stats.feeTotals.pending ?? 0}\n`
    const total = (stats.feeTotals.collected ?? 0) + (stats.feeTotals.pending ?? 0)
    if (total > 0) {
      csv += `Collection Rate,${Math.round(((stats.feeTotals.collected ?? 0) / total) * 100)}%\n`
    }
  }
  
  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${termLabel}-${yearLabel}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Analytics() {
  const [stats, setStats]                   = useState(null)
  const [prevStats, setPrevStats]           = useState(null)
  const [classPerf, setClassPerf]           = useState([])
  const [audit, setAudit]                   = useState([])
  const [classes, setClasses]               = useState([])
  const [academicYears, setAcademicYears]   = useState([])
  const [term, setTerm]                     = useState('')
  const [year, setYear]                     = useState(String(new Date().getFullYear()))
  const [classId, setClassId]               = useState('')
  const [loading, setLoading]               = useState(true)
  const [perfLoading, setPerfLoading]       = useState(false)
  const [defaultersCount, setDefaultersCount] = useState(null)
  const [defaultersLoading, setDefaultersLoading] = useState(true)
  const [disciplineCount, setDisciplineCount] = useState(null)
  const [disciplineLoading, setDisciplineLoading] = useState(true)
  const [errorMsg, setErrorMsg]             = useState('')
  const [perfError, setPerfError]           = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const params = {}
      if (term) params.term = term
      if (year) params.year = year
      
      const prevTermParams = getPrevTermParams(term, year)
      const dashboardCurrent = analyticsAPI.dashboard(params)
      const audit = analyticsAPI.audit()
      const dashboardPrev = prevTermParams ? analyticsAPI.dashboard(prevTermParams) : Promise.resolve(null)
      
      const [dashRes, auditRes, prevRes] = await Promise.allSettled([
        dashboardCurrent,
        audit,
        dashboardPrev,
      ])
      
      if (dashRes.status === 'fulfilled') setStats(dashRes.value.data.data)
      else setErrorMsg('Failed to load analytics data.')
      
      if (auditRes.status === 'fulfilled') setAudit(auditRes.value.data.data ?? [])
      
      if (prevRes.status === 'fulfilled' && prevRes.value) {
        setPrevStats(prevRes.value.data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadDefaulters = async () => {
    setDefaultersLoading(true)
    try {
      const res = await feeAPI.getDefaulters()
      const count = (res.data.data ?? res.data ?? []).length
      setDefaultersCount(count)
    } catch {
      setDefaultersCount(null)
    } finally {
      setDefaultersLoading(false)
    }
  }

  const loadDiscipline = async () => {
    setDisciplineLoading(true)
    try {
      const params = {}
      if (term) params.term = term
      if (year) params.year = year
      const res = await disciplineAPI.getRecords(params)
      const records = res.data.data ?? []
      setDisciplineCount(records.length)
    } catch {
      setDisciplineCount(null)
    } finally {
      setDisciplineLoading(false)
    }
  }

  const loadAcademicYears = async () => {
    try {
      const res = await academicAPI.getYears()
      const records = res.data.data ?? []
      const years = [...new Set(records.map(r => r.year))].sort((a, b) => b - a)
      setAcademicYears(years)
    } catch {
      setAcademicYears([])
    }
  }

  const loadClassPerf = async (cId) => {
    if (!cId) { setClassPerf([]); return }
    setPerfLoading(true)
    setPerfError('')
    try {
      const params = { classId: cId }
      if (term) params.term = term
      if (year) params.year = year
      const res = await analyticsAPI.classPerformance(params)
      setClassPerf(res.data.data ?? [])
    } catch {
      setClassPerf([])
      setPerfError('Failed to load class performance data.')
    } finally {
      setPerfLoading(false)
    }
  }

  useEffect(() => {
    classAPI.getAll().then(r => setClasses(r.data.data ?? [])).catch(() => {})
    loadAcademicYears()
    loadDefaulters()
  }, [])

  useEffect(() => {
    loadDashboard()
    loadDiscipline()
  }, [term, year])

  useEffect(() => {
    loadClassPerf(classId)
  }, [classId, term, year])

  useEffect(() => {
    if (academicYears.length > 0) {
      const currentYear = String(new Date().getFullYear())
      if (academicYears.includes(Number(currentYear))) {
        setYear(currentYear)
      } else if (academicYears.length > 0) {
        setYear(String(academicYears[0]))
      }
    }
  }, [academicYears])

  // Prepare chart data
  const gradeTotal = stats ? Object.values(stats.gradeDist).reduce((s, v) => s + v, 0) : 0
  const gradeData = stats
    ? Object.entries(stats.gradeDist).map(([name, value]) => ({ name, value, total: gradeTotal }))
    : []

  const attTotal = stats ? Object.values(stats.attDist).reduce((s, v) => s + v, 0) : 0
  const attData = stats
    ? Object.entries(stats.attDist).map(([name, value]) => ({ 
      name, 
      value,
      pct: attTotal > 0 ? Math.round((value / attTotal) * 100) : 0 
    }))
    : []

  const termTrendData = stats?.termTrend
    ? stats.termTrend.map(t => ({ term: t.term, assessments: t._count }))
    : []

  const classPerfData = classPerf
    .sort((a, b) => b.counts.EE - a.counts.EE)
    .slice(0, 10)
    .map(s => ({
      name: s.fullName.split(' ')[0],
      EE: s.counts.EE,
      ME: s.counts.ME,
      AE: s.counts.AE,
      BE: s.counts.BE,
    }))

  const topPerformers = classPerf
    .filter(s => s.counts.EE > 0)
    .sort((a, b) => b.counts.EE - a.counts.EE)
    .slice(0, 5)

  const bottomPerformers = classPerf
    .filter(s => s.counts.BE > 0)
    .sort((a, b) => b.counts.BE - a.counts.BE)
    .slice(0, 5)

  const termChartH = useChartHeight(220, 160)
  const feeChartH = useChartHeight(160, 160)

  return (
    <Layout>
      {/* Print-only header */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">School Analytics Report</h1>
        <p className="text-sm text-slate-600">
          Term: {term || 'All Terms'} | Year: {year} | {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="mb-6 no-print">
        <PageHeader
          title="Analytics"
          subtitle="School-wide performance overview"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center no-print mb-6">
        <Select
          value={year}
          onChange={e => setYear(e.target.value)}
          options={[
            { value: '', label: 'All Years' },
            ...academicYears.map(y => ({ value: String(y), label: String(y) })),
          ]}
          className="w-32"
        />
        <Select
          value={term}
          onChange={e => setTerm(e.target.value)}
          options={TERMS}
          className="w-36"
        />
        <Button variant="secondary" onClick={() => exportCSV(stats, defaultersCount, disciplineCount, term, year)} disabled={loading || !stats}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
        <Button variant="secondary" onClick={() => window.print()} disabled={loading}>
          <Printer className="w-4 h-4 mr-1" /> Print
        </Button>
        <Button variant="secondary" onClick={loadDashboard} disabled={loading} className="ml-auto">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {errorMsg && <Alert type="error" className="mb-4">{errorMsg}</Alert>}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {loading || defaultersLoading || disciplineLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[88px]" />)
        ) : (
          <>
            <StatCard
              title="Students"
              value={stats?.studentCount ?? 0}
              icon={Users}
              color="brand"
            />
            <StatCard
              title="Teachers"
              value={stats?.teacherCount ?? 0}
              icon={GraduationCap}
              color="violet"
            />
            <StatCard
              title="Classes"
              value={stats?.classCount ?? 0}
              icon={BookOpen}
              color="emerald"
            />
            <StatCard
              title="Attendance Rate"
              value={stats?.attendanceRate != null ? `${stats.attendanceRate}%` : 'N/A'}
              icon={TrendingUp}
              color="amber"
              trend={!loading && term ? <TrendBadge current={stats?.attendanceRate} previous={prevStats?.attendanceRate} /> : undefined}
            />
            <StatCard
              title="Fee Collection Rate"
              value={
                (() => {
                  if (!stats?.feeTotals) return 'N/A'
                  const { collected = 0, pending = 0 } = stats.feeTotals
                  const total = collected + pending
                  return total > 0 ? `${Math.round((collected / total) * 100)}%` : 'N/A'
                })()
              }
              icon={DollarSign}
              color="emerald"
              trend={!loading && term ? <TrendBadge current={(() => {
                if (!stats?.feeTotals) return null
                const { collected = 0, pending = 0 } = stats.feeTotals
                const total = collected + pending
                return total > 0 ? Math.round((collected / total) * 100) : null
              })()} previous={(() => {
                if (!prevStats?.feeTotals) return null
                const { collected = 0, pending = 0 } = prevStats.feeTotals
                const total = collected + pending
                return total > 0 ? Math.round((collected / total) * 100) : null
              })()} /> : undefined}
            />
            <StatCard
              title="Fee Defaulters"
              value={defaultersCount ?? 'N/A'}
              icon={AlertTriangle}
              color="rose"
            />
            <StatCard
              title="Discipline Incidents"
              value={disciplineCount ?? 'N/A'}
              icon={ShieldAlert}
              color="orange"
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Grade distribution */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-sm text-slate-700">Grade Distribution (CBC)</h3>
          {loading ? (
            <Skeleton className="h-[200px]" />
          ) : gradeData.every(d => d.value === 0) ? (
            <EmptyState icon={ClipboardList} title="No assessments recorded yet" description="Add assessments to see grade distribution." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={gradeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                >
                  {gradeData.map(entry => (
                    <Cell key={entry.name} fill={GRADE_COLORS[entry.name] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip content={<GradePieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Attendance distribution */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-sm text-slate-700">Attendance Breakdown</h3>
          {loading ? (
            <Skeleton className="h-[200px]" />
          ) : attData.every(d => d.value === 0) ? (
            <EmptyState icon={CalendarX} title="No attendance records found" description="Record attendance to see the breakdown." />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === 'pct') return [`${value}%`, 'Percentage']
                    return [value, 'Count']
                  }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <ReferenceLine 
                  y={80} 
                  stroke="#ef4444" 
                  strokeDasharray="4 2" 
                  label={{ value: 'Target (80%)', position: 'insideTopRight', fontSize: 11, fill: '#ef4444' }} 
                />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                  {attData.map(entry => (
                    <Cell key={entry.name} fill={ATT_COLORS[entry.name] ?? '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Term trend + Fee summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-sm text-slate-700">Assessments by Term</h3>
          {loading ? (
            <Skeleton className="h-[160px]" />
          ) : termTrendData.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No term data" description="Assessment data will appear here once terms are recorded." />
          ) : (
            <ResponsiveContainer width="100%" height={feeChartH}>
              <BarChart data={termTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="term" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="assessments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-3 text-sm text-slate-700">Fee Collection Summary</h3>
          {loading ? (
            <Skeleton className="h-[160px]" />
          ) : (
            <>
              {stats?.feeTotals && (
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart
                    data={[{ name: 'Fees', collected: stats.feeTotals.collected ?? 0, pending: stats.feeTotals.pending ?? 0 }]}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip 
                      formatter={(value) => `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Bar dataKey="collected" stackId="fee" fill="#22c55e" />
                    <Bar dataKey="pending" stackId="fee" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="space-y-3 mt-2">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-700 font-medium">Collected</span>
                  <span className="font-bold text-green-700">
                    KES {(stats?.feeTotals?.collected ?? 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm text-amber-700 font-medium">Pending</span>
                  <span className="font-bold text-amber-700">
                    KES {(stats?.feeTotals?.pending ?? 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {stats?.feeTotals && (stats.feeTotals.collected + stats.feeTotals.pending) > 0 && (
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600 font-medium">Collection Rate</span>
                    <span className="font-bold text-slate-700">
                      {Math.round(
                        (stats.feeTotals.collected / (stats.feeTotals.collected + stats.feeTotals.pending)) * 100
                      )}%
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Class performance */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-slate-700">Class Performance</h3>
          <Select
            value={classId}
            onChange={e => setClassId(e.target.value)}
            options={[
              { value: '', label: 'Select a class…' },
              ...classes.map(c => ({ value: String(c.id), label: `${c.name} ${c.stream}` })),
            ]}
            placeholder="Select a class…"
            className="w-48"
          />
        </div>

        {perfError && <Alert type="error" className="mb-3">{perfError}</Alert>}

        {!classId ? (
          <EmptyState icon={BarChart2} title="Select a class" description="Choose a class from the dropdown to view student performance." />
        ) : perfLoading ? (
          <Skeleton className="h-[220px]" />
        ) : classPerfData.length === 0 ? (
          <EmptyState icon={BarChart2} title="No assessment data" description="No assessment data for this class and term." />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={termChartH}>
              <BarChart data={classPerfData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="EE" stackId="a" fill={GRADE_COLORS.EE} />
                <Bar dataKey="ME" stackId="a" fill={GRADE_COLORS.ME} />
                <Bar dataKey="AE" stackId="a" fill={GRADE_COLORS.AE} />
                <Bar dataKey="BE" stackId="a" fill={GRADE_COLORS.BE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Top and Bottom Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border-l-4 border-emerald-500 pl-3">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Top Performers (EE)</h4>
                {topPerformers.length === 0 ? (
                  <p className="text-xs text-slate-400">No students with EE grades.</p>
                ) : (
                  <ul className="space-y-1">
                    {topPerformers.map(s => (
                      <li key={s.id} className="text-xs text-slate-600 flex justify-between">
                        <span>{s.fullName}</span>
                        <span className="font-medium text-emerald-600">{s.counts.EE}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-l-4 border-red-500 pl-3">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Bottom Performers (BE)</h4>
                {bottomPerformers.length === 0 ? (
                  <p className="text-xs text-slate-400">No students with BE grades.</p>
                ) : (
                  <ul className="space-y-1">
                    {bottomPerformers.map(s => (
                      <li key={s.id} className="text-xs text-slate-600 flex justify-between">
                        <span>{s.fullName}</span>
                        <span className="font-medium text-red-600">{s.counts.BE}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Audit log */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 text-sm text-slate-700">Recent Audit Log</h3>
        {loading ? (
          <SkeletonTable rows={5} cols={3} />
        ) : (
          <div className="space-y-1 text-sm max-h-64 overflow-y-auto">
            {audit.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No audit entries yet" description="System actions will be logged here." />
            ) : (
              audit.map(a => (
                <div key={a.id} className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-slate-700">
                    <span className="font-medium">{a.action}</span>{' '}
                    <span className="text-slate-500">{a.entity}</span>
                    {a.entityId ? <span className="text-slate-400"> #{a.entityId}</span> : null}
                  </span>
                  <span className="text-slate-400 text-xs whitespace-nowrap ml-4">
                    {a.user?.fullName ?? 'System'} · {new Date(a.createdAt).toLocaleString('en-KE')}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </Layout>
  )
}
