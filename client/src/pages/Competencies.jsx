import { useState, useEffect, useMemo } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, TextArea, Modal, Alert, EmptyState, SkeletonTable, PageHeader, Badge, ConfirmModal } from '../components/ui'
import { competencyAPI, studentAPI } from '../api'
import { useAuthStore } from '../store'
import { Award, Plus, Edit2, Trash2, Search } from 'lucide-react'

const LEVEL_BADGE = { DEVELOPING: 'warning', PROFICIENT: 'info', ADVANCED: 'success', MASTERED: 'purple' }
const EMPTY = { code: '', name: '', description: '', grade: '', learningAreaId: '', studentId: '', level: 'DEVELOPING', evidence: '' }

export default function Competencies() {
  const { user } = useAuthStore()
  const [competencies, setCompetencies] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchCompetencies(); fetchStudents() }, [])

  const fetchCompetencies = async () => {
    try {
      setLoading(true)
      if (user?.role === 'STUDENT') {
        const { data: meRes } = await studentAPI.getMe()
        const me = meRes?.data
        if (!me) { setCompetencies([]); setLoading(false); return }
        const res = await competencyAPI.getStudent(me.id)
        const raw = res.data.data?.competencies ?? res.data.data ?? []
        setCompetencies(raw)
        return
      }
      const res = await competencyAPI.getReport()
      const groups = res.data.data ?? []
      const flat = groups.flatMap(g =>
        (g.competencies ?? []).map(c => ({ ...c, student: { fullName: g.studentName, id: g.studentId } }))
      )
      setCompetencies(flat)
    } catch { setError('Failed to load competencies.') }
    finally { setLoading(false) }
  }
  const fetchStudents = async () => {
    try {
      const { data } = await studentAPI.getAll()
      setStudents(data.data?.students ?? data.data ?? [])
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load students.')
    }
  }


  const openModal = (c = null) => {
    setModalError('')
    if (c) { setEditingId(c.id); setForm({ code: c.code ?? '', name: c.name ?? '', description: c.description ?? '', grade: c.grade ?? '', learningAreaId: c.learningAreaId ?? '', studentId: c.studentId ?? '', level: c.level ?? 'DEVELOPING', evidence: c.evidence ?? '' }) }
    else { setEditingId(null); setForm(EMPTY) }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setModalError('')
    try {
      const payload = { ...form, learningAreaId: Number(form.learningAreaId), studentId: Number(form.studentId) }
      if (editingId) await competencyAPI.update(editingId, payload)
      else await competencyAPI.create(payload)
      fetchCompetencies(); setShowModal(false)
    } catch (err) { setModalError(err.response?.data?.message ?? 'Failed to save.') }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await competencyAPI.delete(deleteId); setDeleteId(null); fetchCompetencies() }
    catch (err) { setError(err.response?.data?.message ?? 'Failed to delete.'); setDeleteId(null) }
    finally { setDeleting(false) }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return competencies
    const q = search.toLowerCase()
    return competencies.filter(c =>
      c.student?.fullName?.toLowerCase().includes(q) ||
      c.name?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q)
    )
  }, [competencies, search])

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader title="Competencies" subtitle="CBC competency tracking"
          actions={['ADMIN','TEACHER'].includes(user?.role) && <Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Competency</Button>} />

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        {/* Level legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(LEVEL_BADGE).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-3 py-1.5 shadow-soft">
              <Badge variant={v}>{k}</Badge>
            </div>
          ))}
        </div>

        {/* Search */}
        <Card>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student name or competency…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 w-full"
            />
          </div>
        </Card>

        <Card>
          {loading ? <SkeletonTable rows={5} cols={5} /> : filtered.length === 0 ? (
            <EmptyState icon={Award} title={search ? 'No results found' : 'No competencies yet'} description={search ? 'Try a different search term.' : 'Add competencies to track student progress.'}
              action={!search && ['ADMIN','TEACHER'].includes(user?.role) && <Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Competency</Button>} />
          ) : (
            <>
              {search && (
                <p className="text-xs text-slate-400 mb-3">Showing {filtered.length} of {competencies.length} records</p>
              )}
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Code</th><th>Competency</th><th>Student</th><th>Level</th><th>Grade</th>{['ADMIN','TEACHER'].includes(user?.role) && <th>Actions</th>}</tr></thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c.id}>
                        <td><span className="font-mono text-xs bg-surface-100 px-2 py-0.5 rounded">{c.code}</span></td>
                        <td>
                          <p className="font-medium text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                        </td>
                        <td className="text-slate-500">{c.student?.fullName ?? `#${c.studentId}`}</td>
                        <td><Badge variant={LEVEL_BADGE[c.level] ?? 'gray'}>{c.level}</Badge></td>
                        <td className="text-slate-500">{c.grade}</td>
                        {['ADMIN','TEACHER'].includes(user?.role) && (
                          <td>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => openModal(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Competency' : 'Add Competency'} size="lg"
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleSubmit}>{editingId ? 'Update' : 'Create'}</Button>,
        ]}>
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required placeholder="e.g. MATH-G4-01" />
            <Input label="Grade" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} required placeholder="e.g. 4" />
          </div>
          <Input label="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <TextArea label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Level" value={form.level} onChange={e => setForm({...form, level: e.target.value})} required
              options={[{value:'DEVELOPING',label:'Developing'},{value:'PROFICIENT',label:'Proficient'},{value:'ADVANCED',label:'Advanced'},{value:'MASTERED',label:'Mastered'}]} />
            <Select label="Student" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} required
              options={students.map(s => ({value: s.id, label: s.fullName}))} />
          </div>
          <Input label="Evidence (optional)" value={form.evidence} onChange={e => setForm({...form, evidence: e.target.value})} />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Competency"
        message="This will remove this competency and all its skill assessments."
      />
    </Layout>
  )
}
