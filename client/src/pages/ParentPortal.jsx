import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Button, Alert, EmptyState, SkeletonTable, PageHeader, Badge, StatCard, TextArea, Select } from '../components/ui'
import { parentAPI, teacherAPI, exportAPI, feeAPI } from '../api'
import { useAuthStore } from '../store'
import { Heart, Download, Send, CalendarCheck, ClipboardList, BarChart3, MessageSquare, GraduationCap, School, DollarSign, CreditCard, FileText } from 'lucide-react'

const TABS = ['Overview', 'Grades', 'Report Cards', 'Attendance', 'Assignments', 'Messages', 'Fees']

export default function ParentPortal() {
  const { user } = useAuthStore()
  const [parentId, setParentId]         = useState(null)
  const [children, setChildren]         = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [grades, setGrades]             = useState([])
  const [attendance, setAttendance]     = useState(null)
  const [assignments, setAssignments]   = useState([])
  const [messages, setMessages]         = useState([])
  const [reportCards, setReportCards]   = useState([])
  const [teachers, setTeachers]         = useState([])
  const [tab, setTab]                   = useState('Overview')
  const [loading, setLoading]           = useState(true)
  const [childLoading, setChildLoading] = useState(false)
  const [error, setError]               = useState('')
  const [msgForm, setMsgForm]           = useState({ teacherId: '', subject: '', content: '' })
  const [sending, setSending]           = useState(false)

  // Fee state
  const [feeStatement, setFeeStatement] = useState(null)
  const [feeTerm, setFeeTerm]           = useState('1')
  const [feeYear, setFeeYear]           = useState('2026')
  const [mpesaPhone, setMpesaPhone]     = useState('')
  const [mpesaAmount, setMpesaAmount]   = useState('')
  const [mpesaLoading, setMpesaLoading] = useState(false)
  const [mpesaMsg, setMpesaMsg]         = useState('')

  const location = useLocation()
  useEffect(() => { if (user?.id) fetchParent() }, [user, location.search])

  const fetchParent = async () => {
    try {
      setLoading(true)
      const { data } = await parentAPI.getMe()
      const p = data.data
      setParentId(p?.id)
      const kids = p?.students ?? []
      setChildren(kids)
      // Check URL params for preferred child or tab
      const params = new URLSearchParams(location.search)
      const paramChildId = params.get('childId')
      const paramTab = params.get('tab')
      if (paramTab) setTab(paramTab)
      if (kids.length > 0) {
        const preferred = paramChildId ? kids.find(k => String(k.id) === String(paramChildId)) : null
        await loadChildData(p.id, preferred ?? kids[0])
      }
    } catch { setError('Failed to load parent data.') }
    finally { setLoading(false) }
  }

  const loadChildData = async (pid, child) => {
    setSelectedChild(child)
    setChildLoading(true)
    try {
      const [gradesRes, attRes, asnRes, msgsRes, teachersRes, rcRes] = await Promise.all([
        parentAPI.getChildrenGrades(pid),
        parentAPI.getChildrenAttendance(pid),
        parentAPI.getChildrenAssignments(pid),
        parentAPI.getMessages(pid),
        teacherAPI.getAll(),
        parentAPI.getChildrenReportCards(pid),
      ])
      const studentData = gradesRes.data.data ?? []
      const childData = studentData.find(s => s.id === child.id) ?? studentData[0]
      setGrades(childData?.assessments ?? [])
      const attSummary = attRes.data.data ?? {}
      setAttendance(attSummary[child.id] ?? Object.values(attSummary)[0] ?? null)
      setAssignments(asnRes.data.data ?? [])
      setMessages(msgsRes.data.data ?? [])
      setTeachers(teachersRes.data.data ?? [])
      const rcData = rcRes.data.data ?? []
      const childRc = rcData.find(s => s.id === child.id) ?? rcData[0]
      setReportCards(childRc?.reportCards ?? [])

      // Load fee statement for this child (Term 1 2026 by default)
      try {
        const feeRes = await feeAPI.getStatement(child.id, { term: feeTerm, year: feeYear })
        setFeeStatement(feeRes.data.data ?? null)
      } catch { setFeeStatement(null) }
    } catch { setError('Failed to load child data.') }
    finally { setChildLoading(false) }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await parentAPI.sendMessage(parentId, { ...msgForm, teacherId: Number(msgForm.teacherId) })
      setMsgForm({ teacherId: '', subject: '', content: '' })
      const { data } = await parentAPI.getMessages(parentId)
      setMessages(data.data ?? [])
    } catch (err) { setError(err.response?.data?.message ?? 'Failed to send message.') }
    finally { setSending(false) }
  }

  const handleExport = async () => {
    try {
      const res = await exportAPI.gradesExcel({ studentId: selectedChild?.id })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `grades-${selectedChild?.admissionNo ?? selectedChild?.id}.xlsx`
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
    } catch { setError('Export failed.') }
  }

  const attPct = attendance?.total > 0 ? Math.round((attendance.present / attendance.total) * 100) : 0

  const handleMpesaPay = async (e) => {
    e.preventDefault()
    if (!mpesaPhone || !mpesaAmount) return
    setMpesaLoading(true); setMpesaMsg('')
    try {
      const res = await feeAPI.initiateMpesa({
        studentId: selectedChild.id,
        amount: Number(mpesaAmount),
        phone: mpesaPhone,
        term: feeTerm,
        year: Number(feeYear),
      })
      const checkoutRequestId = res.data.data.checkoutRequestId
      setMpesaMsg('⏳ Prompt sent! Check your phone and enter your M-Pesa PIN…')

      // Poll for result every 3 seconds for up to 60 seconds
      let attempts = 0
      const poll = setInterval(async () => {
        attempts++
        try {
          const statusRes = await feeAPI.getPaymentStatus(checkoutRequestId)
          const { status, notes } = statusRes.data.data

          if (status === 'COMPLETED') {
            clearInterval(poll)
            setMpesaLoading(false)
            setMpesaMsg('✓ Payment successful! Your balance has been updated.')
            setMpesaPhone(''); setMpesaAmount('')
            loadFeeStatement(selectedChild.id, feeTerm, feeYear)
          } else if (status === 'FAILED') {
            clearInterval(poll)
            setMpesaLoading(false)
            const reason = notes ?? 'Payment was cancelled or failed.'
            setMpesaMsg(`✗ ${reason} Please try again.`)
          } else if (attempts >= 20) {
            // 60 seconds elapsed — stop polling
            clearInterval(poll)
            setMpesaLoading(false)
            setMpesaMsg('✗ Payment timed out. If you entered your PIN, please wait a moment and refresh.')
          }
        } catch (err) {
          // Keep polling; ignore transient errors.
        }
      }, 3000)

    } catch (err) {
      setMpesaLoading(false)
      setMpesaMsg('✗ ' + (err.response?.data?.message ?? 'Failed to initiate payment. Please try again.'))
    }
  }

  const loadFeeStatement = async (childId, term, year) => {
    try {
      const feeRes = await feeAPI.getStatement(childId, { term, year })
      setFeeStatement(feeRes.data.data ?? null)
    } catch { setFeeStatement(null) }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {tab !== 'Fees' && <PageHeader title="Parent Portal" subtitle="Monitor your children's academic progress" />}
        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        {children.length === 0 ? (
          <Card>
            <EmptyState icon={Heart} title="No children linked"
              description="Contact the school administrator to link your children to your account." />
          </Card>
        ) : (
          <>
            {/* Child selector (hidden inside Fees view) */}
            {tab !== 'Fees' && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {children.length === 1 ? 'Your child' : 'Select a child'}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {children.map(c => {
                    const active = selectedChild?.id === c.id
                    return (
                      <button key={c.id} onClick={() => loadChildData(parentId, c)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                          ${active ? 'bg-brand-600 text-white border-brand-600 shadow-soft' : 'bg-white text-slate-700 border-surface-200 hover:border-brand-300'}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                          ${active ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'}`}>
                          {c.fullName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${active ? 'text-white' : 'text-slate-800'}`}>{c.fullName}</p>
                          <p className={`text-xs truncate ${active ? 'text-white/70' : 'text-slate-400'}`}>
                            {c.admissionNo} · {c.class?.name ?? 'No class'}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Child profile card (hidden in Fees view) */}
            {tab !== 'Fees' && selectedChild && (
              <Card className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-r from-brand-50 to-white border-brand-200">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {selectedChild.fullName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-slate-900">{selectedChild.fullName}</h2>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <GraduationCap className="w-3.5 h-3.5" />{selectedChild.admissionNo}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <School className="w-3.5 h-3.5" />{selectedChild.class?.name ?? 'No class assigned'}
                    </span>
                    <Badge variant={selectedChild.gender === 'MALE' ? 'info' : 'purple'}>{selectedChild.gender}</Badge>
                  </div>
                </div>
                <div className={`text-center px-4 py-2 rounded-xl shrink-0 ${attPct >= 75 ? 'bg-emerald-50' : attPct >= 50 ? 'bg-amber-50' : 'bg-red-50'}`}>
                  <p className={`text-2xl font-bold ${attPct >= 75 ? 'text-emerald-600' : attPct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{attPct}%</p>
                  <p className="text-xs text-slate-500">Attendance</p>
                </div>
              </Card>
            )}

            {/* Tabs (hidden in Fees view) */}
            {tab !== 'Fees' && (
              <div className="flex gap-1 bg-surface-100 p-1 rounded-xl overflow-x-auto">
                {TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                      ${tab === t ? 'bg-white text-slate-800 shadow-soft' : 'text-slate-500 hover:text-slate-700'}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}

            {childLoading ? (
              <Card><SkeletonTable rows={4} cols={3} /></Card>
            ) : (
              <>
                {/* Overview */}
                {tab === 'Overview' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard title="Attendance"  value={`${attPct}%`}             icon={CalendarCheck} color="emerald" />
                      <StatCard title="Present"     value={attendance?.present ?? 0} icon={CalendarCheck} color="emerald" />
                      <StatCard title="Absent"      value={attendance?.absent  ?? 0} icon={CalendarCheck} color="rose" />
                      <StatCard title="Assignments" value={assignments.length}        icon={ClipboardList} color="amber" />
                    </div>
                    <Card>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">Recent Grades</h3>
                        <Button variant="secondary" size="sm" onClick={handleExport}><Download className="w-3.5 h-3.5" />Export</Button>
                      </div>
                      {grades.length === 0 ? (
                        <EmptyState icon={BarChart3} title="No grades yet" description="Grades will appear here once assessments are recorded." />
                      ) : (
                        <div className="table-wrapper">
                          <table className="data-table">
                            <thead><tr><th>Sub-Strand</th><th>Score</th><th>Term</th></tr></thead>
                            <tbody>
                              {grades.slice(0, 5).map((g, i) => (
                                <tr key={i}>
                                  <td>{g.subStrand?.name ?? '—'}</td>
                                  <td><Badge variant={{ EE:'success', ME:'info', AE:'warning', BE:'danger' }[g.score] ?? 'gray'}>{g.score}</Badge></td>
                                  <td><Badge variant="brand">Term {g.term}</Badge></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* Grades */}
                {tab === 'Grades' && (
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-800">All Grades — {selectedChild?.fullName}</h3>
                      <Button variant="secondary" size="sm" onClick={handleExport}><Download className="w-3.5 h-3.5" />Export Excel</Button>
                    </div>
                    {grades.length === 0 ? (
                      <EmptyState icon={BarChart3} title="No grades" description="No assessments recorded yet." />
                    ) : (
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead><tr><th>Learning Area</th><th>Strand</th><th>Sub-Strand</th><th>Score</th><th>Term</th></tr></thead>
                          <tbody>
                            {grades.map((g, i) => (
                              <tr key={i}>
                                <td>{g.subStrand?.strand?.learningArea?.name ?? '—'}</td>
                                <td>{g.subStrand?.strand?.name ?? '—'}</td>
                                <td>{g.subStrand?.name ?? '—'}</td>
                                <td><Badge variant={{ EE:'success', ME:'info', AE:'warning', BE:'danger' }[g.score] ?? 'gray'}>{g.score}</Badge></td>
                                <td><Badge variant="brand">Term {g.term}</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                )}

                {tab === 'Report Cards' && (
                  <Card>
                    <h3 className="font-semibold text-slate-800 mb-4">Report Cards — {selectedChild?.fullName}</h3>
                    {reportCards.length === 0 ? (
                      <EmptyState icon={FileText} title="No report cards" description="Report cards will appear here once generated by the school." />
                    ) : (
                      <div className="space-y-2">
                        {reportCards.map(rc => (
                          <div key={rc.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-3">
                            <span>Term {rc.term} {rc.year} — Grade {rc.overallGrade}</span>
                            <Button size="sm" variant="secondary" onClick={async () => {
                              const { data } = await exportAPI.reportCardPDF(rc.id)
                              const url = URL.createObjectURL(data)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `report-card-${rc.id}.pdf`
                              a.click()
                            }}><Download className="w-3.5 h-3.5" />PDF</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}

                {/* Attendance */}
                {tab === 'Attendance' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard title="Attendance Rate" value={`${attPct}%`}             icon={CalendarCheck} color="emerald" />
                      <StatCard title="Present"         value={attendance?.present ?? 0} icon={CalendarCheck} color="emerald" />
                      <StatCard title="Absent"          value={attendance?.absent  ?? 0} icon={CalendarCheck} color="rose" />
                      <StatCard title="Late"            value={attendance?.late    ?? 0} icon={CalendarCheck} color="amber" />
                    </div>
                    {!attendance?.total && (
                      <Card>
                        <EmptyState icon={CalendarCheck} title="No attendance records" description="Attendance will appear here once recorded." />
                      </Card>
                    )}
                  </div>
                )}

                {/* Assignments */}
                {tab === 'Assignments' && (
                  <Card>
                    <h3 className="font-semibold text-slate-800 mb-4">Assignments — {selectedChild?.fullName}</h3>
                    {assignments.length === 0 ? (
                      <EmptyState icon={ClipboardList} title="No assignments" description="No assignments yet." />
                    ) : (
                      <div className="table-wrapper">
                        <table className="data-table">
                          <thead><tr><th>Title</th><th>Due Date</th><th>Status</th></tr></thead>
                          <tbody>
                            {assignments.map((a, i) => {
                              const title = a.assignment?.title ?? a.title ?? '—'
                              const due   = a.assignment?.dueDate ?? a.dueDate
                              return (
                                <tr key={i}>
                                  <td className="font-medium text-slate-800">{title}</td>
                                  <td className="text-slate-500">{due ? new Date(due).toLocaleDateString('en-KE') : '—'}</td>
                                  <td><Badge variant={a.submitted ? 'success' : 'warning'}>{a.submitted ? 'Submitted' : 'Pending'}</Badge></td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                )}

                {/* Fees */}
                {tab === 'Fees' && (
                  <div className="space-y-4">
                    {/* Heading and Statement */}
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">Fee Payment</h2>
                      <p className="text-slate-500">Manage your child's school fee payments and view payment history</p>
                    </div>

                    {/* Student Details Card */}
                    {selectedChild && (
                      <Card className="bg-gradient-to-r from-brand-50 to-white border-brand-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                            {selectedChild.fullName?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900">{selectedChild.fullName}</h3>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                              <span>{selectedChild.admissionNo}</span>
                              <span>•</span>
                              <span>{selectedChild.class?.name ?? 'No class'}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Child Selector (if 2+ children) */}
                    {children.length > 1 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          {children.length === 1 ? 'Your child' : 'Select a child'}
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          {children.map(c => {
                            const active = selectedChild?.id === c.id
                            return (
                              <button key={c.id} onClick={() => loadChildData(parentId, c)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                                  ${active ? 'bg-brand-600 text-white border-brand-600 shadow-soft' : 'bg-white text-slate-700 border-surface-200 hover:border-brand-300'}`}>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                                  ${active ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700'}`}>
                                  {c.fullName?.[0]}
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-sm font-semibold truncate ${active ? 'text-white' : 'text-slate-800'}`}>{c.fullName}</p>
                                  <p className={`text-xs truncate ${active ? 'text-white/70' : 'text-slate-400'}`}>
                                    {c.admissionNo} · {c.class?.name ?? 'No class'}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Term/Year pills */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Term:</span>
                      {['1','2','3'].map(t => (
                        <button key={t} onClick={() => { setFeeTerm(t); setMpesaMsg(''); loadFeeStatement(selectedChild.id, t, feeYear) }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all
                            ${feeTerm === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-surface-200 hover:border-brand-400'}`}>
                          Term {t}
                        </button>
                      ))}
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-2">Year:</span>
                      {['2025','2026','2027'].map(y => (
                        <button key={y} onClick={() => { setFeeYear(y); setMpesaMsg(''); loadFeeStatement(selectedChild.id, feeTerm, y) }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all
                            ${feeYear === y ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-surface-200 hover:border-brand-400'}`}>
                          {y}
                        </button>
                      ))}
                    </div>

                    {feeStatement ? (
                      <>
                        {/* Fee summary — 3 clear boxes */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white border border-surface-200 rounded-2xl p-4 text-center shadow-soft">
                            <p className="text-xs text-slate-400 font-medium mb-1">Total Fees</p>
                            <p className="text-xl font-bold text-slate-800">KES {feeStatement.summary.totalFees.toLocaleString()}</p>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                            <p className="text-xs text-emerald-600 font-medium mb-1">Paid</p>
                            <p className="text-xl font-bold text-emerald-700">KES {feeStatement.summary.totalPaid.toLocaleString()}</p>
                          </div>
                          <div className={`rounded-2xl p-4 text-center border ${feeStatement.summary.balance > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            <p className={`text-xs font-medium mb-1 ${feeStatement.summary.balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>Balance</p>
                            <p className={`text-xl font-bold ${feeStatement.summary.balance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                              KES {feeStatement.summary.balance.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        {feeStatement.summary.totalFees > 0 && (
                          <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-soft">
                            <div className="flex justify-between text-xs text-slate-500 mb-2">
                              <span className="font-medium">Payment Progress</span>
                              <span className="font-semibold">{Math.round((feeStatement.summary.totalPaid / feeStatement.summary.totalFees) * 100)}% paid</span>
                            </div>
                            <div className="h-4 bg-surface-100 rounded-full overflow-hidden">
                              <div
                                className={`h-4 rounded-full transition-all duration-500 ${feeStatement.summary.balance <= 0 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                                style={{ width: `${Math.min((feeStatement.summary.totalPaid / feeStatement.summary.totalFees) * 100, 100)}%` }}
                              />
                            </div>
                            {feeStatement.summary.balance <= 0 && (
                              <p className="text-xs text-emerald-600 font-semibold mt-2 text-center">✓ Fees fully paid for this term</p>
                            )}
                          </div>
                        )}

                        {/* M-Pesa payment form */}
                        {feeStatement.summary.balance > 0 && (
                          <div className="bg-white border-2 border-brand-200 rounded-2xl p-5 shadow-soft">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shrink-0">
                                <CreditCard className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">Pay via M-Pesa</p>
                                <p className="text-xs text-slate-400">A payment prompt will be sent to your phone</p>
                              </div>
                            </div>

                            {mpesaMsg && (
                              <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border
                                ${mpesaMsg.startsWith('✓') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                  mpesaMsg.startsWith('⏳') ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                  'bg-red-50 border-red-200 text-red-700'}`}>
                                {mpesaMsg}
                              </div>
                            )}

                            <form onSubmit={handleMpesaPay} className="space-y-3">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Your M-Pesa Number</label>
                                <input className="input-field" placeholder="e.g. 0712 345 678"
                                  value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)}
                                  required disabled={mpesaLoading} />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                  Amount (KES) — <span className="text-red-500 font-bold">Balance: KES {feeStatement.summary.balance.toLocaleString()}</span>
                                </label>
                                <input className="input-field" type="number"
                                  value={mpesaAmount} onChange={e => setMpesaAmount(e.target.value)}
                                  placeholder={String(feeStatement.summary.balance)}
                                  max={feeStatement.summary.balance} min="1"
                                  required disabled={mpesaLoading} />
                              </div>
                              <button type="submit" disabled={mpesaLoading}
                                className={`w-full py-3 rounded-xl font-bold text-white transition-all text-sm
                                  ${mpesaLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 active:scale-95'}`}>
                                {mpesaLoading ? '⏳ Waiting for payment…' : `Pay KES ${mpesaAmount || feeStatement.summary.balance.toLocaleString()} via M-Pesa`}
                              </button>
                            </form>
                          </div>
                        )}

                        {/* Payment history */}
                        {feeStatement.payments.length > 0 && (
                          <div className="bg-white border border-surface-200 rounded-2xl shadow-soft overflow-hidden">
                            <div className="px-4 py-3 border-b border-surface-100">
                              <p className="font-semibold text-slate-800 text-sm">Payment History</p>
                            </div>
                            <div className="divide-y divide-surface-100">
                              {feeStatement.payments.map((p, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                      ${p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                                        p.status === 'PENDING'   ? 'bg-amber-100 text-amber-600' :
                                                                    'bg-red-100 text-red-600'}`}>
                                      {p.status === 'COMPLETED' ? '✓' : p.status === 'PENDING' ? '…' : '✗'}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">KES {Number(p.amount).toLocaleString()}</p>
                                      <p className="text-xs text-slate-400">
                                        {new Date(p.paymentDate).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })}
                                        {p.mpesaRef ? ` · Ref: ${p.mpesaRef}` : ''}
                                      </p>
                                      {p.status === 'FAILED' && p.notes && (
                                        <p className="text-xs text-red-500">{p.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                  <Badge variant={p.method === 'MPESA' ? 'success' : p.method === 'CASH' ? 'info' : 'brand'}>{p.method}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <Card>
                        <EmptyState icon={DollarSign} title="No fee information"
                          description="Fee structure for this term has not been set up yet. Contact the school office." />
                      </Card>
                    )}
                  </div>
                )}

                {/* Messages */}
                {tab === 'Messages' && (
                  <div className="space-y-5">
                    <Card>
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Send className="w-4 h-4 text-brand-600" />Send Message to Teacher
                      </h3>
                      <form onSubmit={handleSendMessage} className="space-y-4">
                        <Select label="Teacher" required value={msgForm.teacherId}
                          onChange={e => setMsgForm({...msgForm, teacherId: e.target.value})}
                          options={teachers.map(t => ({value: t.id, label: t.fullName}))} />
                        <input className="input-field" placeholder="Subject" value={msgForm.subject}
                          onChange={e => setMsgForm({...msgForm, subject: e.target.value})} required />
                        <TextArea placeholder="Your message…" value={msgForm.content}
                          onChange={e => setMsgForm({...msgForm, content: e.target.value})} required />
                        <Button type="submit" disabled={sending}>
                          <Send className="w-4 h-4" />{sending ? 'Sending…' : 'Send Message'}
                        </Button>
                      </form>
                    </Card>
                    <Card>
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-brand-600" />Message History
                      </h3>
                      {messages.length === 0 ? (
                        <EmptyState icon={MessageSquare} title="No messages" description="Your messages will appear here." />
                      ) : (
                        <div className="space-y-3">
                          {messages.map((m, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${m.isRead ? 'border-surface-200 bg-surface-50' : 'border-brand-200 bg-brand-50'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-slate-800 text-sm">{m.subject}</p>
                                {!m.isRead && <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-1" />}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{m.content}</p>
                              <p className="text-xs text-slate-400 mt-2">
                                From: {m.sender?.fullName ?? '—'} · {new Date(m.createdAt).toLocaleDateString('en-KE')}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

