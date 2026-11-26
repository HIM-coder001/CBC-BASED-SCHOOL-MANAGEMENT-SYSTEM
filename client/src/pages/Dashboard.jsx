import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import Layout from '../components/Layout'
import { StatCard, Card, LoadingSpinner, Alert } from '../components/ui'
import { studentAPI, teacherAPI, classAPI, assessmentAPI, attendanceAPI } from '../api'
import {
  Users, GraduationCap, School, CalendarCheck,
  ClipboardList, BarChart3, Award, FileText, ArrowRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const QUICK_LINKS = [
  { path: '/attendance',   label: 'Attendance',   Icon: CalendarCheck, color: 'text-emerald-600 bg-emerald-50', roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/assignments',  label: 'Assignments',  Icon: ClipboardList, color: 'text-amber-600 bg-amber-50',    roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/grades',       label: 'Grades',       Icon: BarChart3,     color: 'text-brand-600 bg-brand-50',    roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/competencies', label: 'Competencies', Icon: Award,         color: 'text-violet-600 bg-violet-50',  roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/report-cards', label: 'Report Cards', Icon: FileText,      color: 'text-rose-600 bg-rose-50',      roles: ['ADMIN','TEACHER','STUDENT'] },
  { path: '/parent-portal',label: 'Parent Portal',Icon: Users,         color: 'text-rose-600 bg-rose-50',      roles: ['PARENT'] },
]

const SCORE_COLORS = { EE: '#10b981', ME: '#3b82f6', AE: '#f59e0b', BE: '#ef4444' }
const ATT_COLORS   = { Present: '#10b981', Absent: '#ef4444', Late: '#f59e0b', Excused: '#6366f1' }

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({})
  const [gradeData, setGradeData] = useState([])
  const [attData, setAttData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { fetchStats() }, [user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      if (user?.role === 'ADMIN') {
        const [s, t, c, assessRes, attRes] = await Promise.all([
          studentAPI.getAll(),
          teacherAPI.getAll(),
          classAPI.getAll(),
          assessmentAPI.getAll({ limit: 500 }),
          attendanceAPI.getReport({}),
        ])
        setStats({
          students: s.data.data?.students?.length ?? s.data.data?.length ?? 0,
          teachers: t.data.data?.teachers?.length ?? t.data.data?.length ?? 0,
          classes:  c.data.data?.length ?? 0,
        })

        // Grade distribution
        const assessments = assessRes.data.data?.assessments ?? assessRes.data.data ?? []
        const scoreCounts = { EE: 0, ME: 0, AE: 0, BE: 0 }
        assessments.forEach(a => { if (scoreCounts[a.score] !== undefined) scoreCounts[a.score]++ })
        setGradeData(Object.entries(scoreCounts).map(([score, count]) => ({ score, count })))

        // Attendance distribution
        const attReport = attRes.data.data ?? []
        const totals = { Present: 0, Absent: 0, Late: 0, Excused: 0 }
        attReport.forEach(r => {
          totals.Present += r.present ?? 0
          totals.Absent  += r.absent  ?? 0
          totals.Late    += r.late    ?? 0
          totals.Excused += r.excused ?? 0
        })
        setAttData(Object.entries(totals).map(([name, value]) => ({ name, value })))
      }
    } catch {
      setError('Could not load dashboard stats.')
    } finally {
      setLoading(false)
    }
  }

  const visibleLinks = QUICK_LINKS.filter(l => l.roles.includes(user?.role))
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">{greeting} 👋</p>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5 leading-tight">
              {user?.fullName ?? user?.email}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-3 py-2 shadow-soft self-start">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
            <span className="text-xs md:text-sm font-medium text-slate-600 whitespace-nowrap">System online</span>
          </div>
        </div>

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        {/* Admin stats */}
        {user?.role === 'ADMIN' && (
          loading ? <LoadingSpinner /> : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard title="Total Students" value={stats.students ?? '—'} icon={Users}         color="brand"   trend="Enrolled this year" />
                <StatCard title="Total Teachers" value={stats.teachers ?? '—'} icon={GraduationCap} color="emerald" trend="Active staff" />
                <StatCard title="Total Classes"  value={stats.classes  ?? '—'} icon={School}        color="violet"  trend="Across all grades" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Grade distribution bar chart */}
                <Card>
                  <h2 className="text-base font-semibold text-slate-800 mb-4">Grade Distribution (CBC Scores)</h2>
                  {gradeData.every(d => d.count === 0) ? (
                    <p className="text-sm text-slate-400 text-center py-8">No assessment data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={gradeData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="score" tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }}
                          formatter={(v, n, p) => [v, p.payload.score]}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {gradeData.map((entry) => (
                            <Cell key={entry.score} fill={SCORE_COLORS[entry.score] ?? '#94a3b8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {Object.entries(SCORE_COLORS).map(([k, c]) => (
                      <div key={k} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
                        <span className="text-xs text-slate-500">{k}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Attendance pie chart */}
                <Card>
                  <h2 className="text-base font-semibold text-slate-800 mb-4">Attendance Overview</h2>
                  {attData.every(d => d.value === 0) ? (
                    <p className="text-sm text-slate-400 text-center py-8">No attendance data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={attData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {attData.map((entry) => (
                            <Cell key={entry.name} fill={ATT_COLORS[entry.name] ?? '#94a3b8'} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }}
                        />
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </div>
            </>
          )
        )}

        {/* Quick access */}
        <Card>
          <h2 className="text-base font-semibold text-slate-800 mb-4">Quick Access</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
            {visibleLinks.map(({ path, label, Icon, color }) => (
              <Link
                key={path}
                to={path}
                className="group flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border border-surface-200 bg-white hover:border-brand-300 hover:shadow-card transition-all"
              >
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-brand-600 text-center leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'CBC Assessment Tracking', desc: 'Record EE, ME, AE, BE scores against sub-strands for every student.', Icon: BarChart3, color: 'text-brand-600 bg-brand-50', path: '/grades' },
            { title: 'Attendance Management',   desc: 'Mark and monitor daily attendance with percentage reports.',          Icon: CalendarCheck, color: 'text-emerald-600 bg-emerald-50', path: '/attendance' },
            { title: 'Report Card Generation',  desc: 'Auto-generate term report cards and export as PDF.',                 Icon: FileText, color: 'text-rose-600 bg-rose-50', path: '/report-cards' },
            { title: 'Parent Portal',           desc: 'Parents can view grades, attendance, and message teachers.',         Icon: Users, color: 'text-violet-600 bg-violet-50', path: '/parent-portal' },
          ].filter(f => {
            if (f.path === '/parent-portal') return user?.role === 'PARENT' || user?.role === 'ADMIN'
            return true
          }).map(f => (
            <Link key={f.title} to={f.path} className="card flex items-start gap-3 hover:shadow-card hover:border-brand-200 transition-all group">
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${f.color}`}>
                <f.Icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">{f.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 shrink-0 mt-0.5 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}
