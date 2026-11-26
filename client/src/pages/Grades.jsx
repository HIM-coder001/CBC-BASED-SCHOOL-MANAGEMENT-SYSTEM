import { useState, useEffect, useMemo, useRef } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Select, Alert, EmptyState, SkeletonTable, PageHeader, Badge, Modal } from '../components/ui'
import { assessmentAPI, exportAPI, classAPI, learningAreaAPI, studentAPI } from '../api'
import { useAuthStore } from '../store'
import { BarChart3, Download, Search, ClipboardEdit, ChevronDown, X } from 'lucide-react'

// ── Searchable combobox ───────────────────────────────────────────────────
function Combobox({ label, required, value, onChange, options = [], placeholder = 'Type to search…', disabled = false }) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const ref               = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => String(o.value) === String(value))

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  const handleSelect = (opt) => {
    onChange(opt.value)
    setQuery('')
    setOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setQuery('')
  }

  return (
    <div className="space-y-1.5" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          onClick={() => !disabled && setOpen(o => !o)}
          className={`input-field flex items-center justify-between gap-2 cursor-pointer select-none
            ${disabled ? 'bg-surface-100 cursor-not-allowed opacity-60' : 'hover:border-brand-400'}`}
        >
          {open ? (
            <input
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400"
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className={`flex-1 text-sm truncate ${selected ? 'text-slate-800' : 'text-slate-400'}`}>
              {selected ? selected.label : placeholder}
            </span>
          )}
          <div className="flex items-center gap-1 shrink-0">
            {selected && !open && (
              <button type="button" onClick={handleClear} className="text-slate-400 hover:text-slate-600 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-surface-200 rounded-xl shadow-modal overflow-hidden">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-400">No results for "{query}"</p>
            ) : (
              <ul className="max-h-52 overflow-y-auto py-1">
                {filtered.map(opt => (
                  <li key={opt.value}
                    onClick={() => handleSelect(opt)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors
                      ${String(opt.value) === String(value)
                        ? 'bg-brand-50 text-brand-700 font-medium'
                        : 'text-slate-700 hover:bg-surface-50'}`}>
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const SCORE_BADGE  = { EE: 'success', ME: 'info', AE: 'warning', BE: 'danger' }
const SCORE_LABEL  = { EE: 'Exceeds Expectations', ME: 'Meets Expectations', AE: 'Approaches Expectations', BE: 'Below Expectations' }
const SCORE_OPTIONS = [
  { value: '', label: '— skip —' },
  { value: 'EE', label: 'EE — Exceeds Expectations' },
  { value: 'ME', label: 'ME — Meets Expectations' },
  { value: 'AE', label: 'AE — Approaches Expectations' },
  { value: 'BE', label: 'BE — Below Expectations' },
]

export default function Grades() {
  const { user } = useAuthStore()
  const canEnter = ['ADMIN', 'TEACHER'].includes(user?.role)

  // ── View state ────────────────────────────────────────────────────────────
  const [grades, setGrades]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [filters, setFilters] = useState({ term: '', year: '' })
  const [search, setSearch]   = useState('')

  // ── Bulk entry state ──────────────────────────────────────────────────────
  const [showBulk, setShowBulk]           = useState(false)
  const [bulkStep, setBulkStep]           = useState(1)          // 1 | 2 | 3
  const [bulkError, setBulkError]         = useState('')
  const [bulkSubmitting, setBulkSubmitting] = useState(false)

  // step 1 selections
  const [classes, setClasses]             = useState([])
  const [learningAreas, setLearningAreas] = useState([])
  const [selClassId, setSelClassId]       = useState('')
  const [selTerm, setSelTerm]             = useState('')
  const [selAreaId, setSelAreaId]         = useState('')

  // step 2 selections
  const [selStrandId, setSelStrandId]     = useState('')
  const [selSubStrandId, setSelSubStrandId] = useState('')

  // step 3 — rows: [{ studentId, fullName, admissionNo, score }]
  const [bulkRows, setBulkRows]           = useState([])

  // ── Derived curriculum lists ──────────────────────────────────────────────
  const selectedClass  = classes.find(c => String(c.id) === String(selClassId))
  const classGrade     = selectedClass?.grade ?? null
  // Only show learning areas matching the selected class's grade
  const filteredAreas  = classGrade
    ? learningAreas.filter(a => a.grade === classGrade)
    : learningAreas
  const selectedArea   = filteredAreas.find(a => String(a.id) === String(selAreaId))
  const strands        = selectedArea?.strands ?? []
  const selectedStrand = strands.find(s => String(s.id) === String(selStrandId))
  const subStrands     = selectedStrand?.subStrands ?? []

  // ── Load support data on mount ────────────────────────────────────────────
  useEffect(() => {
    fetchGrades()
    if (canEnter) {
      classAPI.getAll().then(r => setClasses(r.data.data ?? [])).catch(() => {})
      learningAreaAPI.getAll().then(r => setLearningAreas(r.data.data ?? [])).catch(() => {})
    }
  }, [user])

  const fetchGrades = async (f = filters) => {
    try {
      setLoading(true)
      const params = {}
      if (f.term) params.term = f.term
      if (f.year) params.year = f.year
      // For STUDENT role, scope to their own studentId
      if (user?.role === 'STUDENT') {
        const { data: me } = await studentAPI.getMe()
        if (me?.data?.id) params.studentId = me.data.id
      }
      const { data } = await assessmentAPI.getAll(params)
      setGrades(data.data?.assessments ?? data.data ?? [])
    } catch { setError('Failed to load grades.') }
    finally { setLoading(false) }
  }

  const handleExport = async (format) => {
    try {
      const fn = format === 'csv' ? exportAPI.gradesCSV : exportAPI.gradesExcel
      const res = await fn(filters)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = `grades.${format}`
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
    } catch { setError('Export failed.') }
  }

  // ── Bulk modal helpers ────────────────────────────────────────────────────
  const openBulk = () => {
    setBulkStep(1); setBulkError('')
    setSelClassId(''); setSelTerm(''); setSelAreaId('')
    setSelStrandId(''); setSelSubStrandId(''); setBulkRows([])
    setShowBulk(true)
  }

  const goToStep2 = () => {
    if (!selClassId || !selTerm || !selAreaId) {
      setBulkError('Please select a class, term, and learning area.'); return
    }
    setBulkError(''); setSelStrandId(''); setSelSubStrandId('')
    setBulkStep(2)
  }

  const goToStep3 = async () => {
    if (!selStrandId || !selSubStrandId) {
      setBulkError('Please select a strand and sub-strand.'); return
    }
    setBulkError('')
    // Load students for the selected class
    try {
      const { data } = await classAPI.getAll()
      const cls = (data.data ?? []).find(c => String(c.id) === String(selClassId))
      const students = cls?.students ?? []
      setBulkRows(students.map(s => ({ studentId: s.id, fullName: s.fullName, admissionNo: s.admissionNo, score: '' })))
      setBulkStep(3)
    } catch { setBulkError('Failed to load students for this class.') }
  }

  const handleBulkScoreChange = (studentId, score) => {
    setBulkRows(rows => rows.map(r => r.studentId === studentId ? { ...r, score } : r))
  }

  const handleBulkSubmit = async () => {
    const entries = bulkRows.filter(r => r.score !== '')
    if (entries.length === 0) { setBulkError('Please enter at least one score.'); return }
    setBulkSubmitting(true); setBulkError('')
    try {
      const { data } = await assessmentAPI.bulkCreate({
        subStrandId: Number(selSubStrandId),
        term: selTerm,
        entries: entries.map(e => ({ studentId: e.studentId, score: e.score })),
      })
      setShowBulk(false)
      fetchGrades()
      // brief success feedback via the page error state (green)
      setError(`✓ Saved ${data.data.created} assessment${data.data.created !== 1 ? 's' : ''}.`)
      setTimeout(() => setError(''), 4000)
    } catch (err) {
      setBulkError(err.response?.data?.message ?? 'Failed to save assessments.')
    } finally {
      setBulkSubmitting(false)
    }
  }

  // ── Filtered view ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return grades
    const q = search.toLowerCase()
    return grades.filter(g =>
      g.student?.fullName?.toLowerCase().includes(q) ||
      g.student?.admissionNo?.toLowerCase().includes(q)
    )
  }, [grades, search])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Grades & Assessments"
          subtitle="CBC competency scores"
          actions={
            <div className="flex gap-2 flex-wrap">
              {canEnter && (
                <Button onClick={openBulk}>
                  <ClipboardEdit className="w-4 h-4" />Enter Marks
                </Button>
              )}
              <Button variant="secondary" onClick={() => handleExport('csv')}><Download className="w-4 h-4" />CSV</Button>
              <Button variant="secondary" onClick={() => handleExport('excel')}><Download className="w-4 h-4" />Excel</Button>
            </div>
          }
        />

        {error && (
          <Alert type={error.startsWith('✓') ? 'success' : 'error'} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <Select label="Term" value={filters.term} onChange={e => setFilters({...filters, term: e.target.value})}
              options={[{value:'1',label:'Term 1'},{value:'2',label:'Term 2'},{value:'3',label:'Term 3'}]} />
            <Select label="Year" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})}
              options={[{value:'2025',label:'2025'},{value:'2026',label:'2026'}]} />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Search by student name…" value={search}
                onChange={e => setSearch(e.target.value)} className="input-field pl-9 w-full" />
            </div>
            <Button onClick={() => fetchGrades(filters)}>Apply</Button>
          </div>
        </Card>

        {/* Score legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(SCORE_LABEL).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-3 py-1.5 shadow-soft">
              <Badge variant={SCORE_BADGE[k]}>{k}</Badge>
              <span className="text-xs text-slate-500">{v}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <Card>
          {loading ? <SkeletonTable rows={6} cols={6} /> : filtered.length === 0 ? (
            <EmptyState icon={BarChart3} title="No assessments found"
description={search ? 'No results match your search.' : 'Use "Enter Marks" to record CBC assessments.'}



              action={canEnter && !search && <Button onClick={openBulk}><ClipboardEdit className="w-4 h-4" />Enter Marks</Button>}
            />
          ) : (
            <>
              {search && <p className="text-xs text-slate-400 mb-3">Showing {filtered.length} of {grades.length} records</p>}
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr>
                    <th>Student</th><th>Learning Area</th><th>Strand</th><th>Sub-Strand</th><th>Score</th><th>Term</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((g, i) => (
                      <tr key={i}>
                        <td className="font-medium text-slate-800">{g.student?.fullName ?? `#${g.studentId}`}</td>
                        <td className="text-slate-500">{g.subStrand?.strand?.learningArea?.name ?? '—'}</td>
                        <td className="text-slate-500">{g.subStrand?.strand?.name ?? '—'}</td>
                        <td className="text-slate-500">{g.subStrand?.name ?? '—'}</td>
                        <td><Badge variant={SCORE_BADGE[g.score] ?? 'gray'}>{g.score}</Badge></td>
                        <td><Badge variant="brand">Term {g.term}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ── Bulk Entry Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={showBulk}
        onClose={() => setShowBulk(false)}
        title={`Enter Marks — Step ${bulkStep} of 3`}
        size="lg"
        actions={
          bulkStep === 1 ? [
            <Button key="c" variant="secondary" onClick={() => setShowBulk(false)}>Cancel</Button>,
            <Button key="n" onClick={goToStep2}>Next →</Button>,
          ] : bulkStep === 2 ? [
            <Button key="b" variant="secondary" onClick={() => setBulkStep(1)}>← Back</Button>,
            <Button key="n" onClick={goToStep3}>Next →</Button>,
          ] : [
            <Button key="b" variant="secondary" onClick={() => setBulkStep(2)}>← Back</Button>,
            <Button key="s" onClick={handleBulkSubmit} disabled={bulkSubmitting}>
              {bulkSubmitting ? 'Saving…' : 'Save Marks'}
            </Button>,
          ]
        }
      >
        {bulkError && <Alert type="error" className="mb-4">{bulkError}</Alert>}

        {/* Step 1 — Class / Term / Learning Area */}
        {bulkStep === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Select the class, term, and learning area you want to enter marks for.</p>
            <Combobox
              label="Class" required
              value={selClassId}
              onChange={v => { setSelClassId(v); setSelAreaId(''); setSelStrandId(''); setSelSubStrandId('') }}
              options={classes.map(c => ({ value: c.id, label: `${c.name} (Grade ${c.grade})` }))}
              placeholder="Type to search class…"
            />
            <Select
              label="Term" required
              value={selTerm}
              onChange={e => setSelTerm(e.target.value)}
              options={[{value:'1',label:'Term 1'},{value:'2',label:'Term 2'},{value:'3',label:'Term 3'}]}
            />
            <Combobox
              label="Learning Area" required
              value={selAreaId}
              onChange={v => { setSelAreaId(v); setSelStrandId(''); setSelSubStrandId('') }}
              options={filteredAreas.map(a => ({ value: a.id, label: a.name }))}
              placeholder={selClassId ? `Type to search (${filteredAreas.length} areas for Grade ${classGrade})…` : 'Select a class first'}
              disabled={!selClassId}
            />
          </div>
        )}

        {/* Step 2 — Strand / Sub-Strand */}
        {bulkStep === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Select the strand and sub-strand being assessed.</p>
            <Combobox
              label="Strand" required
              value={selStrandId}
              onChange={v => { setSelStrandId(v); setSelSubStrandId('') }}
              options={strands.map(s => ({ value: s.id, label: s.name }))}
              placeholder="Type to search strand…"
              disabled={strands.length === 0}
            />
            <Combobox
              label="Sub-Strand" required
              value={selSubStrandId}
              onChange={v => setSelSubStrandId(v)}
              options={subStrands.map(ss => ({ value: ss.id, label: ss.name }))}
              placeholder={selStrandId ? 'Type to search sub-strand…' : 'Select a strand first'}
              disabled={!selStrandId || subStrands.length === 0}
            />
            {selSubStrandId && (
              <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 text-sm text-brand-700">
                Assessing: <strong>{selectedArea?.name}</strong> → <strong>{selectedStrand?.name}</strong> → <strong>{subStrands.find(ss => String(ss.id) === String(selSubStrandId))?.name}</strong>
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Student score grid */}
        {bulkStep === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Enter a score for each student. Leave blank to skip.
              </p>
              <span className="text-xs text-slate-400">{bulkRows.filter(r => r.score).length}/{bulkRows.length} filled</span>
            </div>

            {/* Quick-fill all */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">Set all to:</span>
              {['EE','ME','AE','BE'].map(sc => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => setBulkRows(rows => rows.map(r => ({ ...r, score: sc })))}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors
                    ${sc === 'EE' ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' :
                      sc === 'ME' ? 'border-blue-300 text-blue-700 hover:bg-blue-50' :
                      sc === 'AE' ? 'border-amber-300 text-amber-700 hover:bg-amber-50' :
                                    'border-red-300 text-red-700 hover:bg-red-50'}`}
                >
                  {sc}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setBulkRows(rows => rows.map(r => ({ ...r, score: '' })))}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-surface-100 transition-colors"
              >
                Clear all
              </button>
            </div>

            {bulkRows.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No students enrolled in this class.</p>
            ) : (
              <div className="border border-surface-200 rounded-xl overflow-hidden">
                <div className="bg-surface-50 px-4 py-2 border-b border-surface-200 grid grid-cols-[1fr_auto] gap-4">
                  <span className="text-xs font-semibold text-slate-500">Student</span>
                  <span className="text-xs font-semibold text-slate-500 w-48">CBC Score</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-surface-100">
                  {bulkRows.map(r => (
                    <div key={r.studentId} className="grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{r.fullName}</p>
                        <p className="text-xs text-slate-400">{r.admissionNo}</p>
                      </div>
                      <select
                        value={r.score}
                        onChange={e => handleBulkScoreChange(r.studentId, e.target.value)}
                        className={`w-48 text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors
                          ${r.score === 'EE' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                            r.score === 'ME' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                            r.score === 'AE' ? 'bg-amber-50 border-amber-300 text-amber-700' :
                            r.score === 'BE' ? 'bg-red-50 border-red-300 text-red-700' :
                                               'bg-white border-surface-200 text-slate-500'}`}
                      >
                        {SCORE_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  )
}
