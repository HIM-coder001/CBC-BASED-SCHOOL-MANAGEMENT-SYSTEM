import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, Modal, Alert, EmptyState, SkeletonTable, PageHeader, Badge, StatCard } from '../components/ui'
import { feeAPI, studentAPI } from '../api'

import { DollarSign, Plus, Trash2, CreditCard, Users, TrendingUp, AlertCircle } from 'lucide-react'

const TERMS   = [{value:'1',label:'Term 1'},{value:'2',label:'Term 2'},{value:'3',label:'Term 3'}]
const YEARS   = [{value:'2025',label:'2025'},{value:'2026',label:'2026'},{value:'2027',label:'2027'}]
const GRADES  = ['1','2','3','4','5','6'].map(g => ({value:g, label:`Grade ${g}`}))
const METHODS = [{value:'CASH',label:'Cash'},{value:'MPESA',label:'M-Pesa'},{value:'BANK',label:'Bank Transfer'}]

const STATUS_BADGE = { PAID: 'success', PARTIAL: 'warning', UNPAID: 'danger' }

export default function Fees() {

  const [tab, setTab]               = useState('overview')
  const [overview, setOverview]     = useState([])
  const [structures, setStructures] = useState([])

  const [students, setStudents]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  // Filters
  const [filterTerm, setFilterTerm] = useState('1')
  const [filterYear, setFilterYear] = useState('2026')
  const [filterGrade, setFilterGrade] = useState('')

  // Modals
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal]     = useState(false)
  const [structureForm, setStructureForm] = useState({ grade: '', term: '1', year: '2026', amount: '', description: '' })
  const [paymentForm, setPaymentForm]     = useState({ studentId: '', amount: '', method: 'CASH', mpesaRef: '', notes: '', term: '1', year: '2026' })
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [modalError, setModalError] = useState('')
  const [saving, setSaving]         = useState(false)
  const [defaulters, setDefaulters] = useState([])

  useEffect(() => { loadAll() }, [filterTerm, filterYear, filterGrade])
  useEffect(() => {
    if (tab === 'defaulters') {
      feeAPI.getDefaulters({ term: filterTerm, year: filterYear }).then(r => setDefaulters(r.data.data ?? [])).catch(() => {})
    }
  }, [tab, filterTerm, filterYear])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [ovRes, stRes, stuRes] = await Promise.all([
        feeAPI.getOverview({ term: filterTerm, year: filterYear, grade: filterGrade || undefined }),
        feeAPI.getStructures(),
        studentAPI.getAll(),
      ])
      setOverview(ovRes.data.data ?? [])
      setStructures(stRes.data.data ?? [])
      setStudents(stuRes.data.data?.students ?? stuRes.data.data ?? [])
    } catch { setError('Failed to load fee data.') }
    finally { setLoading(false) }
  }

  const handleSaveStructure = async (e) => {
    e.preventDefault(); setModalError(''); setSaving(true)
    try {
      await feeAPI.createStructure({ ...structureForm, amount: Number(structureForm.amount), year: Number(structureForm.year) })
      setShowStructureModal(false)
      loadAll()
    } catch (err) { setModalError(err.response?.data?.message ?? 'Failed to save.') }
    finally { setSaving(false) }
  }

  const handleDeleteStructure = async (id) => {
    if (!window.confirm('Delete this fee structure?')) return
    try { await feeAPI.deleteStructure(id); loadAll() }
    catch (err) { setError(err.response?.data?.message ?? 'Failed to delete.') }
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault(); setModalError(''); setSaving(true)
    try {
      await feeAPI.recordPayment({ ...paymentForm, amount: Number(paymentForm.amount), studentId: Number(selectedStudentId), year: Number(paymentForm.year) })
      setShowPaymentModal(false)
      setSelectedStudentId('')
      setPaymentForm({ studentId: '', amount: '', method: 'CASH', mpesaRef: '', notes: '', term: '1', year: '2026' })
      loadAll()
    } catch (err) { setModalError(err.response?.data?.message ?? 'Failed to record payment.') }
    finally { setSaving(false) }
  }

  const openPaymentModal = () => {
    setModalError('')
    setSelectedStudentId('')
    setShowPaymentModal(true)
  }

  // Summary stats
  const totalExpected = overview.reduce((s, r) => s + r.totalFees, 0)
  const totalCollected = overview.reduce((s, r) => s + r.totalPaid, 0)
  const totalBalance   = overview.reduce((s, r) => s + r.balance, 0)
  const unpaidCount    = overview.filter(r => r.balance > 0).length

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader title="Fees Management" subtitle="Track fee structures, payments, and balances"
          actions={
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" onClick={() => { setModalError(''); setShowStructureModal(true) }}>
                <Plus className="w-4 h-4" />Fee Structure
              </Button>
              <Button onClick={openPaymentModal}>
                <CreditCard className="w-4 h-4" />Record Payment
              </Button>
            </div>
          }
        />

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Expected"  value={`KES ${totalExpected.toLocaleString()}`}   icon={DollarSign}   color="brand" />
          <StatCard title="Collected" value={`KES ${totalCollected.toLocaleString()}`}  icon={TrendingUp}   color="emerald" />
          <StatCard title="Balance"   value={`KES ${totalBalance.toLocaleString()}`}    icon={AlertCircle}  color="rose" />
          <StatCard title="In Arrears" value={`${unpaidCount} students`}                icon={Users}        color="amber" />
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
            <Select label="Term" value={filterTerm} onChange={e => setFilterTerm(e.target.value)} options={TERMS} />
            <Select label="Year" value={filterYear} onChange={e => setFilterYear(e.target.value)} options={YEARS} />
            <Select label="Grade (optional)" value={filterGrade} onChange={e => setFilterGrade(e.target.value)} options={GRADES} />
            <Button onClick={loadAll}>Refresh</Button>
            <Button variant="secondary" onClick={async () => {
              await feeAPI.generateInvoices({ term: filterTerm, year: Number(filterYear) })
              loadAll()
            }}>Generate invoices</Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
          {[['overview','Student Balances'],['defaulters','Defaulters'],['structures','Fee Structures']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${tab === k ? 'bg-white text-slate-800 shadow-soft' : 'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Student Balances */}
        {tab === 'overview' && (
          <Card>
            {loading ? <SkeletonTable rows={6} cols={6} /> : overview.length === 0 ? (
              <EmptyState icon={Users} title="No students found" description="Add students and fee structures to see balances." />
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Student</th><th>Admission No.</th><th>Grade</th><th>Expected</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
                  <tbody>
                    {overview.map((r, i) => (
                      <tr key={i}>
                        <td className="font-medium text-slate-800">{r.student.fullName}</td>
                        <td><span className="font-mono text-xs bg-surface-100 px-2 py-0.5 rounded">{r.student.admissionNo}</span></td>
                        <td className="text-slate-500">Grade {r.student.class?.grade ?? '—'}</td>
                        <td className="text-slate-600">KES {r.totalFees.toLocaleString()}</td>
                        <td className="text-emerald-600 font-medium">KES {r.totalPaid.toLocaleString()}</td>
                        <td className={`font-semibold ${r.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          KES {r.balance.toLocaleString()}
                        </td>
                        <td><Badge variant={STATUS_BADGE[r.status] ?? 'gray'}>{r.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {tab === 'defaulters' && (
          <Card>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>Student</th><th>Class</th><th>Due</th><th>Paid</th><th>Parent phone</th></tr></thead>
                <tbody>
                  {defaulters.map(inv => (
                    <tr key={inv.id}>
                      <td>{inv.student?.fullName}</td>
                      <td>{inv.student?.class?.name}</td>
                      <td>KES {(inv.amountDue - inv.amountPaid).toLocaleString()}</td>
                      <td>KES {inv.amountPaid.toLocaleString()}</td>
                      <td>{inv.student?.parent?.phone ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Fee Structures */}
        {tab === 'structures' && (
          <Card>
            {structures.length === 0 ? (
              <EmptyState icon={DollarSign} title="No fee structures" description="Add a fee structure to define how much each grade pays per term."
                action={<Button onClick={() => setShowStructureModal(true)}><Plus className="w-4 h-4" />Add Structure</Button>} />
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Grade</th><th>Term</th><th>Year</th><th>Amount (KES)</th><th>Description</th><th>Actions</th></tr></thead>
                  <tbody>
                    {structures.map(s => (
                      <tr key={s.id}>
                        <td><Badge variant="brand">Grade {s.grade}</Badge></td>
                        <td><Badge variant="info">Term {s.term}</Badge></td>
                        <td className="text-slate-500">{s.year}</td>
                        <td className="font-semibold text-slate-800">KES {Number(s.amount).toLocaleString()}</td>
                        <td className="text-slate-400 text-xs">{s.description ?? '—'}</td>
                        <td>
                          <button onClick={() => handleDeleteStructure(s.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Fee Structure Modal */}
      <Modal isOpen={showStructureModal} onClose={() => setShowStructureModal(false)} title="Add Fee Structure"
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowStructureModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleSaveStructure} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>,
        ]}>
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        <form onSubmit={handleSaveStructure} className="space-y-4">
          <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-700">
            Set the total fees for a specific grade, term, and year. If a structure already exists for that combination it will be updated.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Grade" required value={structureForm.grade} onChange={e => setStructureForm({...structureForm, grade: e.target.value})} options={GRADES} />
            <Select label="Term" required value={structureForm.term} onChange={e => setStructureForm({...structureForm, term: e.target.value})} options={TERMS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Year" required value={structureForm.year} onChange={e => setStructureForm({...structureForm, year: e.target.value})} options={YEARS} />
            <Input label="Amount (KES)" type="number" required value={structureForm.amount} onChange={e => setStructureForm({...structureForm, amount: e.target.value})} placeholder="e.g. 15000" />
          </div>
          <Input label="Description (optional)" value={structureForm.description} onChange={e => setStructureForm({...structureForm, description: e.target.value})} placeholder="e.g. Tuition + lunch" />
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment"
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleRecordPayment} disabled={saving}>{saving ? 'Saving…' : 'Record'}</Button>,
        ]}>
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        <p className="text-sm text-slate-500 mb-4">
          Select the student to record a payment for.
        </p>
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {students.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No students found. Add students first.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {students.map(s => {
                const checked = selectedStudentId === s.id
                return (
                  <label key={s.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${checked ? 'bg-brand-50 border-brand-300' : 'bg-white border-surface-200 hover:border-brand-200'}`}>
                    <input type="checkbox" checked={checked} onChange={() => setSelectedStudentId(s.id)}
                      className="w-4 h-4 accent-brand-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{s.fullName}</p>
                      <p className="text-xs text-slate-400">{s.admissionNo} · {s.class?.name ?? 'No class'}</p>
                    </div>
                    {checked && <Badge variant="brand">Selected</Badge>}
                  </label>
                )
              })}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (KES)" type="number" required value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} placeholder="e.g. 5000" />
            <Select label="Method" required value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} options={METHODS} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Term" required value={paymentForm.term} onChange={e => setPaymentForm({...paymentForm, term: e.target.value})} options={TERMS} />
            <Select label="Year" required value={paymentForm.year} onChange={e => setPaymentForm({...paymentForm, year: e.target.value})} options={YEARS} />
          </div>
          {paymentForm.method === 'MPESA' && (
            <Input label="M-Pesa Reference" value={paymentForm.mpesaRef} onChange={e => setPaymentForm({...paymentForm, mpesaRef: e.target.value})} placeholder="e.g. QHX7Y8Z9A0" />
          )}
          <Input label="Notes (optional)" value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} />
        </form>
      </Modal>
    </Layout>
  )
}
