import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Modal, Alert, EmptyState, SkeletonTable, PageHeader, Badge, ConfirmModal } from '../components/ui'
import { parentAPI, studentAPI, userAPI } from '../api'
import { Plus, Edit2, Trash2, Users, Search, Link2 } from 'lucide-react'

const EMPTY_FORM = { fullName: '', email: '', phone: '', password: '' }

export default function Parents() {
  const [parents, setParents]   = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [editingId, setEditingId]     = useState(null)
  const [linkingParent, setLinkingParent] = useState(null)
  const [error, setError]       = useState('')
  const [modalError, setModalError] = useState('')
  const [search, setSearch]     = useState('')
  const [form, setForm]         = useState(EMPTY_FORM)
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [saving, setSaving]     = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchParents(); fetchStudents() }, [])

  const fetchParents = async () => {
    try {
      setLoading(true)
      const { data } = await parentAPI.getAll()
      setParents(data.data ?? [])
    } catch { setError('Failed to load parents.') }
    finally { setLoading(false) }
  }

  const fetchStudents = async () => {
    try {
      const { data } = await studentAPI.getAll()
      setStudents(data.data?.students ?? data.data ?? [])
    } catch {}
  }

  const openModal = (p = null) => {
    setModalError('')
    if (p) {
      setEditingId(p.id)
      setForm({ fullName: p.fullName ?? '', email: p.email ?? '', phone: p.phone ?? '', password: '' })
    } else {
      setEditingId(null)
      setForm(EMPTY_FORM)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setModalError(''); setSaving(true)
    try {
      if (editingId) {
        // Update parent record
        await parentAPI.update(editingId, { fullName: form.fullName, email: form.email, phone: form.phone })
      } else {
        // Create user account first, then parent record
        const userRes = await userAPI.create({
          fullName: form.fullName,
          email: form.email,
          password: form.password || 'password',
          role: 'PARENT',
        })
        const userId = userRes.data.data.id
        await parentAPI.create({ fullName: form.fullName, email: form.email, phone: form.phone, userId })
      }
      fetchParents()
      setShowModal(false)
    } catch (err) { setModalError(err.response?.data?.message ?? 'Failed to save parent.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await parentAPI.delete(deleteId); setDeleteId(null); fetchParents() }
    catch (err) { setError(err.response?.data?.message ?? 'Failed to delete.'); setDeleteId(null) }
    finally { setDeleting(false) }
  }

  const openLinkModal = (parent) => {
    setLinkingParent(parent)
    // Pre-select students already linked to this parent
    const linked = students.filter(s => s.parentId === parent.id).map(s => s.id)
    setSelectedStudentIds(linked)
    setModalError('')
    setShowLinkModal(true)
  }

  const toggleStudent = (id) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSaveLinks = async () => {
    setSaving(true); setModalError('')
    try {
      // For each student: if selected → set parentId, if deselected → clear parentId
      const allStudentsForParent = students.filter(s => s.parentId === linkingParent.id)
      const toLink   = selectedStudentIds.filter(id => !allStudentsForParent.find(s => s.id === id))
      const toUnlink = allStudentsForParent.filter(s => !selectedStudentIds.includes(s.id)).map(s => s.id)

      await Promise.all([
        ...toLink.map(id   => studentAPI.update(id, { parentId: linkingParent.id })),
        ...toUnlink.map(id => studentAPI.update(id, { parentId: null })),
      ])

      fetchParents(); fetchStudents()
      setShowLinkModal(false)
    } catch (err) { setModalError(err.response?.data?.message ?? 'Failed to save links.') }
    finally { setSaving(false) }
  }

  const filtered = parents.filter(p =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const studentMap = Object.fromEntries(students.map(s => [s.id, s]))

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Parents & Guardians"
          subtitle={`${parents.length} registered`}
          actions={<Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Parent</Button>}
        />

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="input-field pl-9" placeholder="Search parents…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? <SkeletonTable rows={5} cols={5} /> : filtered.length === 0 ? (
            <EmptyState icon={Users} title="No parents yet"
              description={search ? 'Try a different search.' : 'Add a parent to get started.'}
              action={!search && <Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Parent</Button>} />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr>
                  <th>Full Name</th><th>Email</th><th>Phone</th><th>Children</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(p => {
                    const children = students.filter(s => s.parentId === p.id)
                    return (
                      <tr key={p.id}>
                        <td className="font-medium text-slate-800">{p.fullName}</td>
                        <td className="text-slate-500">{p.email}</td>
                        <td className="text-slate-500">{p.phone}</td>
                        <td>
                          {children.length === 0 ? (
                            <span className="text-slate-300 italic text-xs">None linked</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {children.map(c => (
                                <Badge key={c.id} variant="brand">{c.fullName}</Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => openLinkModal(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Link students">
                              <Link2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => openModal(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(p.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* Add/Edit Parent Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Parent' : 'Add Parent'}
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Create'}</Button>,
        ]}>
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        {!editingId && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 mb-4 text-sm text-brand-700">
            This will create a login account for the parent. They can log in with their email and the password you set.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" required value={form.fullName}
            onChange={e => setForm({...form, fullName: e.target.value})} placeholder="e.g. Grace Mwangi" />
          <Input label="Email Address" type="email" required value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} placeholder="e.g. grace@email.com" />
          <Input label="Phone Number" required value={form.phone}
            onChange={e => setForm({...form, phone: e.target.value})} placeholder="e.g. 0712345678" />
          {!editingId && (
            <Input label="Password" type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="Leave blank to use 'password'" hint="Default password is 'password' if left blank" />
          )}
        </form>
      </Modal>

      {/* Link Students Modal */}
      <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)}
        title={`Link Students — ${linkingParent?.fullName}`}
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowLinkModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleSaveLinks} disabled={saving}>{saving ? 'Saving…' : 'Save Links'}</Button>,
        ]}>
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        <p className="text-sm text-slate-500 mb-4">
          Select the students that belong to this parent. Checked students will be linked to <strong>{linkingParent?.fullName}</strong>.
        </p>
        {students.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No students found. Add students first.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {students.map(s => {
              const checked = selectedStudentIds.includes(s.id)
              const linkedToOther = s.parentId && s.parentId !== linkingParent?.id
              return (
                <label key={s.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                    ${checked ? 'bg-brand-50 border-brand-300' : 'bg-white border-surface-200 hover:border-brand-200'}
                    ${linkedToOther ? 'opacity-50' : ''}`}>
                  <input type="checkbox" checked={checked} onChange={() => !linkedToOther && toggleStudent(s.id)}
                    className="w-4 h-4 accent-brand-600" disabled={linkedToOther} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{s.fullName}</p>
                    <p className="text-xs text-slate-400">{s.admissionNo} · {s.class?.name ?? 'No class'}</p>
                    {linkedToOther && (
                      <p className="text-xs text-amber-500">Already linked to another parent</p>
                    )}
                  </div>
                  {checked && <Badge variant="brand">Selected</Badge>}
                </label>
              )
            })}
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Parent"
        message="This will remove the parent and unlink their children. This cannot be undone."
      />
    </Layout>
  )
}
