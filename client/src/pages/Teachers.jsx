import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, Modal, Alert, EmptyState, SkeletonTable, PageHeader, Badge, ConfirmModal } from '../components/ui'
import { teacherAPI, userAPI, classAPI } from '../api'
import { Plus, Edit2, Trash2, GraduationCap, Search } from 'lucide-react'

const EMPTY = { tscNo: '', fullName: '', email: '', phone: '', subject: '', classId: '', password: '' }

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchTeachers()
    fetchClasses()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const { data } = await teacherAPI.getAll()
      setTeachers(data.data?.teachers ?? data.data ?? [])
    } catch { setError('Failed to load teachers.') }
    finally { setLoading(false) }
  }

  const fetchClasses = async () => {
    try {
      const { data } = await classAPI.getAll()
      setClasses(data.data ?? [])
    } catch {}
  }

  const openModal = (t = null) => {
    setModalError('')
    if (t) {
      setEditingId(t.id)
      setForm({
        tscNo: t.tscNo ?? '',
        fullName: t.fullName ?? '',
        email: t.email ?? '',
        phone: t.phone ?? '',
        subject: t.subject ?? '',
        classId: t.classId ? String(t.classId) : '',
        password: '',
      })
    } else {
      setEditingId(null)
      setForm(EMPTY)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setModalError('')
    try {
      if (editingId) {
        await teacherAPI.update(editingId, {
          tscNo: form.tscNo,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          classId: form.classId ? Number(form.classId) : null,
        })
      } else {
        const userRes = await userAPI.create({
          fullName: form.fullName,
          email: form.email,
          password: form.password || 'password',
          role: 'TEACHER',
        })
        const userId = userRes.data.data.id
        await teacherAPI.create({
          tscNo: form.tscNo,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          userId,
          classId: form.classId ? Number(form.classId) : undefined,
        })
      }
      fetchTeachers(); setShowModal(false)
    } catch (err) { setModalError(err.response?.data?.message ?? 'Failed to save teacher.') }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await teacherAPI.delete(deleteId); setDeleteId(null); fetchTeachers() }
    catch (err) { setError(err.response?.data?.message ?? 'Failed to delete.'); setDeleteId(null) }
    finally { setDeleting(false) }
  }

  const filtered = teachers.filter(t =>
    t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    t.tscNo?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader title="Teachers" subtitle={`${teachers.length} staff members`}
          actions={<Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Teacher</Button>} />

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input-field pl-9" placeholder="Search teachers…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? <SkeletonTable rows={5} cols={5} /> : filtered.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No teachers found" description={search ? 'Try a different search.' : 'Add your first teacher.'} action={!search && <Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Teacher</Button>} />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>TSC No.</th><th>Full Name</th><th>Email</th><th>Subject</th><th>Class</th><th>Phone</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td><span className="font-mono text-xs bg-surface-100 px-2 py-0.5 rounded">{t.tscNo}</span></td>
                      <td className="font-medium text-slate-800">{t.fullName}</td>
                      <td className="text-slate-500">{t.email}</td>
                      <td><Badge variant="brand">{t.subject}</Badge></td>
                      <td className="text-slate-500">{t.class?.name ?? 'Unassigned'}</td>
                      <td className="text-slate-500">{t.phone ?? '—'}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openModal(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Teacher' : 'Add Teacher'}
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleSubmit}>{editingId ? 'Update' : 'Create'}</Button>,
        ]}>
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="TSC Number" value={form.tscNo} onChange={e => setForm({...form, tscNo: e.target.value})} required placeholder="e.g. TSC-12345" />
          <Input label="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+254…" />
            <Input label="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required placeholder="e.g. Mathematics" />
          </div>
          <Select
            label="Class (optional)"
            value={form.classId}
            onChange={e => setForm({ ...form, classId: e.target.value })}
            options={[
              { value: '', label: 'Unassigned' },
              ...classes.map(c => ({ value: String(c.id), label: `${c.name} — Grade ${c.grade} ${c.stream ? `(${c.stream})` : ''}` })),
            ]}
          />
          {!editingId && (
            <Input label="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Set teacher login password" />
          )}
        </form>
      </Modal>
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Teacher"
        message="This will permanently remove the teacher. This cannot be undone."
      />
    </Layout>
  )
}
