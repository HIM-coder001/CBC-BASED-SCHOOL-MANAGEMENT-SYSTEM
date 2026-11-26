import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, Modal, Alert, EmptyState, SkeletonTable, PageHeader, Badge, StatCard } from '../components/ui'
import { attendanceAPI, studentAPI, classAPI } from '../api'
import { useAuthStore } from '../store'
import { CalendarCheck, Plus, CheckSquare } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT',  label: 'Absent'  },
  { value: 'LATE',    label: 'Late'    },
  { value: 'EXCUSED', label: 'Excused' },
]

export default function Attendance() {
  const { user } = useAuthStore()


  const [report, setReport]   = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal]         = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [error, setError]       = useState('')
  const [modalError, setModalError] = useState('')
  const [bulkError, setBulkError]   = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [filters, setFilters]   = useState({ classId: '', term: '', year: '' })
  const [form, setForm] = useState({
    studentId: '', date: new Date().toISOString().split('T')[0],
    status: 'PRESENT', remarks: '', term: '', year: '',
  })

  // Bulk state
  const [bulkClassId, setBulkClassId] = useState('')
  const [bulkDate, setBulkDate]       = useState(new Date().toISOString().split('T')[0])
  const [bulkTerm, setBulkTerm]       = useState('')
  const [bulkYear, setBulkYear]       = useState('')
  const [bulkRows, setBulkRows]       = useState([])

  // Student's own record

  const [myAttendance, setMyAttendance] = useState(null)

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      fetchMyAttendance()
    } else {
      fetchStudents()
      fetchClasses()
      fetchReport()
    }
  }, [user])

  // ── Student view: fetch own attendance summary ────────────────────────────
  const fetchMyAttendance = async () => {
    try {
      setLoading(true)
      const { data: meRes } = await studentAPI.getMe()
      const me = meRes?.data
      if (!me) { setLoading(false); return }

      const { data } = await attendanceAPI.getStudentAttendance(me.id)
      setMyAttendance(data.data)
    } catch { setError('Failed to load your attendance.') }
    finally { setLoading(false) }
  }

  // ── Admin/Teacher view ────────────────────────────────────────────────────
  const fetchReport = async (f = filters) => {
    try {
      setLoading(true)
      const params = {}
      if (f.classId) params.classId = f.classId
      if (f.term)    params.term    = f.term
      if (f.year)    params.year    = f.year
      const { data } = await attendanceAPI.getReport(params)
      setReport(data.data ?? [])
    } catch { setError('Failed to load attendance report.') }
    finally { setLoading(false) }
  }

  const fetchStudents = async () => {
    try {
      const { data } = await studentAPI.getAll()
      setStudents(data.data?.students ?? data.data ?? [])
    } catch (e) {
      setError('Failed to load students.')
    }
  }
  const fetchClasses = async () => {
    try {
      const { data } = await classAPI.getAll()
      setClasses(data.data ?? [])
    } catch (e) {
      setError('Failed to load classes.')
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault(); setModalError('')
    try {
      await attendanceAPI.create({ ...form, studentId: Number(form.studentId) })
      fetchReport(); setShowModal(false)
    } catch (err) { setModalError(err.response?.data?.message ?? 'Failed to record attendance.') }
  }

  const handleBulkClassChange = (classId) => {
    setBulkClassId(classId)
    if (!classId) { setBulkRows([]); return }
    const classStudents = students.filter(s => String(s.classId) === String(classId))
    setBulkRows(classStudents.map(s => ({ studentId: s.id, fullName: s.fullName, admissionNo: s.admissionNo, status: 'PRESENT' })))
  }

  const handleBulkStatusChange = (studentId, status) => {
    setBulkRows(rows => rows.map(r => r.studentId === studentId ? { ...r, status } : r))
  }

  const handleBulkSubmit = async (e) => {
    e.preventDefault(); setBulkError('')
    if (!bulkClassId || !bulkDate || !bulkTerm || !bulkYear) {
      setBulkError('Please fill in class, date, term, and year.'); return
    }
    if (bulkRows.length === 0) { setBulkError('No students found in this class.'); return }
    setBulkSubmitting(true)
    try {
      await Promise.all(bulkRows.map(r =>
        attendanceAPI.create({ studentId: r.studentId, date: bulkDate, status: r.status, term: bulkTerm, year: bulkYear, remarks: '' })
      ))
      fetchReport()
      setShowBulkModal(false)
      setBulkClassId(''); setBulkDate(new Date().toISOString().split('T')[0])
      setBulkTerm(''); setBulkYear(''); setBulkRows([])
    } catch (err) {
      setBulkError(err.response?.data?.message ?? 'Some records failed. Duplicates are skipped.')
      fetchReport()
    } finally { setBulkSubmitting(false) }
  }






  const studentMap = Object.fromEntries(students.map(s => [s.id, s]))

  // ── STUDENT VIEW ──────────────────────────────────────────────────────────
  if (user?.role === 'STUDENT') {
    const att = myAttendance
    const pct = att?.total > 0 ? ((att.present / att.total) * 100).toFixed(1) : '0.0'
    const pctNum = parseFloat(pct)

    return (
      <Layout>
        <div className="space-y-6">
          <PageHeader title="My Attendance" subtitle="Your personal attendance record" />
          {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

          {loading ? <SkeletonTable rows={4} cols={4} /> : !att ? (
            <Card><EmptyState icon={CalendarCheck} title="No attendance records" description="Your attendance will appear here once it has been recorded." /></Card>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Attendance Rate" value={`${pct}%`} icon={CalendarCheck}
                  color={pctNum >= 75 ? 'emerald' : pctNum >= 50 ? 'amber' : 'rose'} />
                <StatCard title="Present" value={att.present} icon={CalendarCheck} color="emerald" />
                <StatCard title="Absent"  value={att.absent}  icon={CalendarCheck} color="rose" />
                <StatCard title="Late"    value={att.late}    icon={CalendarCheck} color="amber" />
              </div>

              {att.records?.length > 0 && (
                <Card>
                  <h3 className="font-semibold text-slate-800 mb-4">Attendance History</h3>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead><tr><th>Date</th><th>Status</th><th>Term</th><th>Remarks</th></tr></thead>
                      <tbody>
                        {att.records.map((r, i) => (
                          <tr key={i}>
                            <td className="text-slate-600">{new Date(r.date).toLocaleDateString('en-KE')}</td>
                            <td>
                              <Badge variant={{ PRESENT:'success', ABSENT:'danger', LATE:'warning', EXCUSED:'info' }[r.status] ?? 'gray'}>
                                {r.status}
                              </Badge>
                            </td>
                            <td><Badge variant="brand">Term {r.term}</Badge></td>
                            <td className="text-slate-400 text-xs">{r.remarks ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </Layout>
    )
  }

  // ── ADMIN / TEACHER VIEW ──────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader title="Attendance" subtitle="Track and review daily attendance"
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setBulkError(''); setShowBulkModal(true) }}>
                <CheckSquare className="w-4 h-4" />Bulk Mark
              </Button>
              <Button onClick={() => { setModalError(''); setShowModal(true) }}>
                <Plus className="w-4 h-4" />Mark Attendance
              </Button>
            </div>
          }
        />

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <Select label="Class" value={filters.classId} onChange={e => setFilters({...filters, classId: e.target.value})}
              options={classes.map(c => ({value: c.id, label: c.name}))} />
            <Select label="Term" value={filters.term} onChange={e => setFilters({...filters, term: e.target.value})}
              options={[{value:'1',label:'Term 1'},{value:'2',label:'Term 2'},{value:'3',label:'Term 3'}]} />
            <Input label="Year" type="number" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} placeholder="2026" />
            <Button onClick={() => fetchReport(filters)}>Apply Filters</Button>
          </div>
        </Card>

        <Card>
          {loading ? <SkeletonTable rows={6} cols={5} /> : report.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No attendance records" description="Mark attendance to see reports here." />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th><th>Attendance %</th></tr></thead>
                <tbody>
                  {report.map((row, i) => {
                    const s = studentMap[row.studentId]
                    const pct = row.percentage ?? (row.total > 0 ? ((row.present / row.total) * 100).toFixed(1) : '0.0')
                    const pctNum = parseFloat(pct)
                    return (
                      <tr key={i}>
                        <td className="font-medium text-slate-800">{s?.fullName ?? row.studentName ?? `Student #${row.studentId}`}</td>
                        <td><Badge variant="success">{row.present ?? 0}</Badge></td>
                        <td><Badge variant="danger">{row.absent ?? 0}</Badge></td>
                        <td><Badge variant="warning">{row.late ?? 0}</Badge></td>
                        <td><Badge variant="info">{row.excused ?? 0}</Badge></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-surface-200 rounded-full h-1.5 max-w-[80px]">
                              <div className={`h-1.5 rounded-full ${pctNum >= 75 ? 'bg-emerald-500' : pctNum >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(pctNum, 100)}%` }} />
                            </div>
                            <span className={`text-xs font-semibold ${pctNum >= 75 ? 'text-emerald-600' : pctNum >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Single mark modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Mark Attendance"
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleSubmit}>Save</Button>,
        ]}>
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Student" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} required
            options={students.map(s => ({value: s.id, label: `${s.admissionNo} — ${s.fullName}`}))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            <Select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})} required options={STATUS_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Term" value={form.term} onChange={e => setForm({...form, term: e.target.value})} required
              options={[{value:'1',label:'Term 1'},{value:'2',label:'Term 2'},{value:'3',label:'Term 3'}]} />
            <Input label="Year" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} required placeholder="2026" />
          </div>
          <Input label="Remarks (optional)" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
        </form>
      </Modal>

      {/* Bulk mark modal */}
      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Mark Attendance" size="lg"
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowBulkModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleBulkSubmit} disabled={bulkSubmitting}>{bulkSubmitting ? 'Saving…' : 'Save All'}</Button>,
        ]}>
        {bulkError && <Alert type="error" className="mb-4">{bulkError}</Alert>}
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Class" value={bulkClassId} onChange={e => handleBulkClassChange(e.target.value)} required
              options={classes.map(c => ({value: c.id, label: c.name}))} />
            <Input label="Date" type="date" value={bulkDate} onChange={e => setBulkDate(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Term" value={bulkTerm} onChange={e => setBulkTerm(e.target.value)} required
              options={[{value:'1',label:'Term 1'},{value:'2',label:'Term 2'},{value:'3',label:'Term 3'}]} />
            <Input label="Year" type="number" value={bulkYear} onChange={e => setBulkYear(e.target.value)} required placeholder="2026" />
          </div>
          {bulkRows.length > 0 && (
            <div className="border border-surface-200 rounded-xl overflow-hidden">
              <div className="bg-surface-50 px-4 py-2 border-b border-surface-200">
                <p className="text-xs font-semibold text-slate-600">{bulkRows.length} students in class</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white border-b border-surface-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Student</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkRows.map(r => (
                      <tr key={r.studentId} className="border-b border-surface-100 last:border-0">
                        <td className="px-4 py-2">
                          <p className="font-medium text-slate-800 text-xs">{r.fullName}</p>
                          <p className="text-slate-400 text-xs">{r.admissionNo}</p>
                        </td>
                        <td className="px-4 py-2">
                          <select value={r.status} onChange={e => handleBulkStatusChange(r.studentId, e.target.value)}
                            className="text-xs border border-surface-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500">
                            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {bulkClassId && bulkRows.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No students found in this class.</p>
          )}
        </form>
      </Modal>
    </Layout>
  )
}
