import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, Modal, Alert, EmptyState, SkeletonTable, PageHeader, Badge, ConfirmModal } from '../components/ui'
import { studentAPI, classAPI, parentAPI } from '../api'
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react'

const EMPTY_FORM = { admissionNo: '', fullName: '', gender: '', dob: '', classId: '', parentId: '' }

export default function Students() {
  const [students, setStudents] = useState([])
  const [classes, setClasses]   = useState([])
  const [parents, setParents]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteId, setDeleteId]   = useState(null)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => { fetchStudents(); fetchClasses(); fetchParents() }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const { data } = await studentAPI.getAll()
      // backend returns { students, total } or flat array
      setStudents(data.data?.students ?? data.data ?? [])
    }
    catch { setError('Failed to load students.') }
    finally { setLoading(false) }
  }
  const fetchClasses = async () => {
    try { const { data } = await classAPI.getAll(); setClasses(data.data ?? []) } catch {}
  }
  const fetchParents = async () => {
    try { const { data } = await parentAPI.getAll(); setParents(data.data ?? []) } catch {}
  }

  const openModal = (s = null) => {
    setModalError('')
    if (s) {
      setEditingId(s.id)
      setForm({ admissionNo: s.admissionNo ?? '', fullName: s.fullName ?? '', gender: s.gender ?? '', dob: s.dob ? s.dob.split('T')[0] : '', classId: s.classId ?? '', parentId: s.parentId ?? '' })
    } else {
      setEditingId(null); setForm(EMPTY_FORM)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setModalError('')
    try {
      const payload = { ...form, classId: form.classId ? Number(form.classId) : undefined, parentId: form.parentId ? Number(form.parentId) : undefined, dob: form.dob ? new Date(form.dob) : undefined }
      if (editingId) await studentAPI.update(editingId, payload)
      else await studentAPI.create(payload)
      fetchStudents(); setShowModal(false)
    } catch (err) { setModalError(err.response?.data?.message ?? 'Failed to save student.') }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await studentAPI.delete(deleteId); setDeleteId(null); fetchStudents() }
    catch (err) { setError(err.response?.data?.message ?? 'Failed to delete student.'); setDeleteId(null) }
    finally { setDeleting(false) }
  }

  const filtered = students.filter(s =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNo?.toLowerCase().includes(search.toLowerCase())
  )

  const classMap  = Object.fromEntries(classes.map(c => [c.id, c]))
  const parentMap = Object.fromEntries(parents.map(p => [p.id, p]))

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Students"
          subtitle={`${students.length} enrolled`}
          actions={<Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Student</Button>}
        />

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <Card>
          {/* Search */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input-field pl-9"
                placeholder="Search by name or admission no…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? <SkeletonTable rows={6} cols={5} /> : filtered.length === 0 ? (
            <EmptyState icon={Users} title="No students found" description={search ? 'Try a different search term.' : 'Add your first student to get started.'} action={!search && <Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Student</Button>} />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr>
                  <th>Admission No.</th><th>Full Name</th><th>Gender</th><th>Class</th><th>Parent</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td><span className="font-mono text-xs bg-surface-100 px-2 py-0.5 rounded">{s.admissionNo}</span></td>
                      <td className="font-medium text-slate-800">{s.fullName}</td>
                      <td><Badge variant={s.gender === 'MALE' ? 'info' : 'purple'}>{s.gender}</Badge></td>
                      <td className="text-slate-500">{classMap[s.classId]?.name ?? <span className="text-slate-300 italic">Unassigned</span>}</td>
                      <td className="text-slate-500">{parentMap[s.parentId]?.fullName ?? <span className="text-slate-300 italic">None</span>}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openModal(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Student' : 'Add Student'}
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleSubmit}>{editingId ? 'Update' : 'Create'}</Button>,
        ]}>
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Admission Number" value={form.admissionNo} onChange={e => setForm({...form, admissionNo: e.target.value})} required placeholder="e.g. ADM-2024-001" />
          <Input label="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required placeholder="e.g. Jane Wanjiku" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Gender" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} required options={[{value:'MALE',label:'Male'},{value:'FEMALE',label:'Female'}]} />
            <Input label="Date of Birth" type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} required />
          </div>
          <Select label="Class (optional)" value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} options={classes.map(c => ({value: c.id, label: `${c.name} — Grade ${c.grade}`}))} />
          <Select label="Parent / Guardian (optional)" value={form.parentId} onChange={e => setForm({...form, parentId: e.target.value})}
            options={parents.map(p => ({value: p.id, label: `${p.fullName} — ${p.email}`}))}
            placeholder="Select parent…" />
        </form>
      </Modal>
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Student"
        message="This will permanently delete the student and all their records. This cannot be undone."
      />
    </Layout>
  )
}
