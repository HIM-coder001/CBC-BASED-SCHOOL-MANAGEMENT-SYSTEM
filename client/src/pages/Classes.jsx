import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Modal, Alert, EmptyState, SkeletonTable, PageHeader, Badge, ConfirmModal } from '../components/ui'
import { classAPI } from '../api'
import { Plus, Edit2, Trash2, School } from 'lucide-react'

const EMPTY = { name: '', grade: '', stream: '' }

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchClasses() }, [])

  const fetchClasses = async () => {
    try { setLoading(true); const { data } = await classAPI.getAll(); setClasses(data.data ?? []) }
    catch { setError('Failed to load classes.') }
    finally { setLoading(false) }
  }

  const openModal = (c = null) => {
    setModalError('')
    if (c) { setEditingId(c.id); setForm({ name: c.name ?? '', grade: c.grade ?? '', stream: c.stream ?? '' }) }
    else { setEditingId(null); setForm(EMPTY) }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setModalError('')
    try {
      if (editingId) await classAPI.update(editingId, form)
      else await classAPI.create(form)
      fetchClasses(); setShowModal(false)
    } catch (err) { setModalError(err.response?.data?.message ?? 'Failed to save class.') }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await classAPI.delete(deleteId); setDeleteId(null); fetchClasses() }
    catch (err) { setError(err.response?.data?.message ?? 'Failed to delete class.'); setDeleteId(null) }
    finally { setDeleting(false) }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader title="Classes" subtitle={`${classes.length} classes`}
          actions={<Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Class</Button>} />

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <Card>
          {loading ? <SkeletonTable rows={4} cols={5} /> : classes.length === 0 ? (
            <EmptyState icon={School} title="No classes yet" description="Create your first class to start enrolling students." action={<Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Class</Button>} />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>Class Name</th><th>Grade</th><th>Stream</th><th>Students</th><th>Teachers</th><th>Actions</th></tr></thead>
                <tbody>
                  {classes.map(c => (
                    <tr key={c.id}>
                      <td className="font-semibold text-slate-800">{c.name}</td>
                      <td><Badge variant="brand">Grade {c.grade}</Badge></td>
                      <td className="text-slate-500">{c.stream ?? '—'}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                          <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold">{c.students?.length ?? 0}</span>
                          students
                        </span>
                      </td>
                      <td className="text-slate-500 text-sm">
                        {c.teachers?.length ? c.teachers.map(t => t.fullName).join(', ') : <span className="text-slate-300 italic">None</span>}
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openModal(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Class' : 'Add Class'}
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleSubmit}>{editingId ? 'Update' : 'Create'}</Button>,
        ]}>
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Class Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Grade 4 Mango" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Grade" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} required placeholder="e.g. 4" />
            <Input label="Stream" value={form.stream} onChange={e => setForm({...form, stream: e.target.value})} placeholder="e.g. Mango" />
          </div>
        </form>
      </Modal>
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Class"
        message="This will delete the class. Students in this class will become unassigned. This cannot be undone."
      />
    </Layout>
  )
}
