import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, TextArea, Modal, Alert, EmptyState, SkeletonTable, PageHeader, Badge } from '../components/ui'
import { assignmentAPI, classAPI, studentAPI } from '../api'
import { useAuthStore } from '../store'
import { ClipboardList, Plus, Edit2, Trash2, Clock } from 'lucide-react'

const EMPTY = { title: '', description: '', classId: '', dueDate: '', term: '', teacherId: '' }

export default function Assignments() {
  const { user } = useAuthStore()
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewAssignment, setViewAssignment] = useState(null)
  const [submissionText, setSubmissionText] = useState('')
  const [error, setError] = useState('')
  const [viewError, setViewError] = useState('')
  const [modalError, setModalError] = useState('')
  const [form, setForm] = useState(EMPTY)

  useEffect(() => { fetchAssignments(); fetchClasses() }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      if (user?.role === 'STUDENT') {
        const { data: meRes } = await studentAPI.getMe()
        const me = meRes?.data
        if (!me) { setAssignments([]); setLoading(false); return }
        const { data } = await assignmentAPI.getStudent(me.id)
        setAssignments(data.data ?? [])
      } else {
        const { data } = await assignmentAPI.getAll()
        setAssignments(data.data ?? [])
      }
    } catch { setError('Failed to load assignments.') }
    finally { setLoading(false) }
  }
  const fetchClasses = async () => {
    try { const { data } = await classAPI.getAll(); setClasses(data.data ?? []) }
    catch (e) { setError('Failed to load classes.') }
  }


  const openModal = (a = null) => {
    setModalError('')
    if (a) { setEditingId(a.id); setForm({ title: a.title ?? '', description: a.description ?? '', classId: a.classId ?? '', dueDate: a.dueDate ? a.dueDate.split('T')[0] : '', term: a.term ?? '', teacherId: a.teacherId ?? '' }) }
    else { setEditingId(null); setForm({ ...EMPTY, teacherId: user?.id ?? '' }) }
    setShowModal(true)
  }

  const openView = (a) => {
    const isStudentView = user?.role === 'STUDENT'
    if (isStudentView) {
      // a is a StudentAssignment with nested assignment
      setViewAssignment(a)
      setSubmissionText(a.submission ?? '')
    } else {
      setViewAssignment(a)
      setSubmissionText('')
    }
    setShowViewModal(true)
  }

  const submitStudentAssignment = async () => {
    if (!submissionText || submissionText.trim().length === 0) {
      setViewError('Submission cannot be empty')
      return
    }

    try {
      const studentId = viewAssignment.studentId
      const assignmentId = viewAssignment.assignmentId
      await assignmentAPI.submit(assignmentId, studentId, { submission: submissionText })
      // refresh list and update modal state
      await fetchAssignments()
      setViewAssignment(prev => ({ ...prev, submitted: true, submission: submissionText }))
      setShowViewModal(false)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to submit assignment.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setModalError('')
    try {
      const payload = { ...form, classId: Number(form.classId), teacherId: Number(form.teacherId) }
      if (editingId) await assignmentAPI.update(editingId, payload)
      else await assignmentAPI.create(payload)
      fetchAssignments(); setShowModal(false)
    } catch (err) { setModalError(err.response?.data?.message ?? 'Failed to save assignment.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return
    try { await assignmentAPI.delete(id); fetchAssignments() }
    catch (err) { setError(err.response?.data?.message ?? 'Failed to delete.') }
  }

  const classMap = Object.fromEntries(classes.map(c => [c.id, c]))


  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader title="Assignments" subtitle={`${assignments.length} total`}
          actions={['ADMIN','TEACHER'].includes(user?.role) && <Button onClick={() => openModal()}><Plus className="w-4 h-4" />New Assignment</Button>} />

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <Card>
          {loading ? <SkeletonTable rows={5} cols={5} /> : assignments.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No assignments yet" description="Create an assignment to get started." action={['ADMIN','TEACHER'].includes(user?.role) && <Button onClick={() => openModal()}><Plus className="w-4 h-4" />New Assignment</Button>} />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>Title</th><th>Class</th><th>Due Date</th><th>Term</th><th>Submissions</th>{['ADMIN','TEACHER'].includes(user?.role) && <th>Actions</th>}</tr></thead>
                <tbody>
                  {assignments.map(a => {
                    // For STUDENT role, data is StudentAssignment with nested assignment
                    const isStudentView = user?.role === 'STUDENT'
                    const assignment = isStudentView ? a.assignment : a
                    const cls = classMap[assignment?.classId]
                    const submitted = isStudentView ? a.submitted : (a.students?.filter(s => s.submitted).length ?? 0)
                    const total = isStudentView ? null : (a.students?.length ?? 0)
                    const overdue = assignment?.dueDate && new Date(assignment.dueDate) < new Date() && !submitted
                    return (
                      <tr key={a.id}>
                        <td>
                          <div onClick={() => user?.role === 'STUDENT' && openView(a)} className={user?.role === 'STUDENT' ? 'cursor-pointer' : ''}>
                            <p className="font-medium text-slate-800">{assignment?.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{assignment?.description}</p>
                          </div>
                        </td>
                        <td className="text-slate-500">{cls?.name ?? assignment?.class?.name ?? '—'}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {overdue && <Clock className="w-3.5 h-3.5 text-red-500" />}
                            <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                              {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-KE') : '—'}
                            </span>
                            {overdue && <Badge variant="danger">Overdue</Badge>}
                          </div>
                        </td>
                        <td><Badge variant="brand">Term {assignment?.term}</Badge></td>
                        <td>
                          {isStudentView ? (
                            <Badge variant={submitted ? 'success' : 'warning'}>{submitted ? 'Submitted' : 'Pending'}</Badge>
                          ) : total > 0 ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-surface-200 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${(submitted/total)*100}%` }} />
                              </div>
                              <span className="text-xs text-slate-500">{submitted}/{total}</span>
                            </div>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>
                        {['ADMIN','TEACHER'].includes(user?.role) && (
                          <td>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => openModal(a)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={viewAssignment?.title || 'Assignment Details'} size="md"
          actions={[
            <Button key="close" variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
          ]}>
          {viewAssignment ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">{(user?.role === 'STUDENT' ? viewAssignment.assignment.description : viewAssignment.description)}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-slate-400">Class</h4>
                  <p className="text-sm">{classMap[(user?.role === 'STUDENT' ? viewAssignment.assignment.classId : viewAssignment.classId)]?.name ?? (user?.role === 'STUDENT' ? viewAssignment.assignment.class?.name : viewAssignment.class?.name) ?? '—'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-400">Due Date</h4>
                  <p className="text-sm">{(user?.role === 'STUDENT' ? viewAssignment.assignment.dueDate : viewAssignment.dueDate) ? new Date(user?.role === 'STUDENT' ? viewAssignment.assignment.dueDate : viewAssignment.dueDate).toLocaleDateString('en-KE') : '—'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs text-slate-400">Term</h4>
                  <p className="text-sm">Term {user?.role === 'STUDENT' ? viewAssignment.assignment.term : viewAssignment.term}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-400">Status</h4>
                  <p className="text-sm">{(user?.role === 'STUDENT' ? (viewAssignment.submitted ? 'Submitted' : 'Pending') : (viewAssignment._submitted ? 'Submitted' : 'Pending'))}</p>
                </div>
              </div>

              {user?.role === 'STUDENT' && (
                <div className="space-y-3">
                  {viewError && <Alert type="error" onClose={() => setViewError('')}>{viewError}</Alert>}
                  <TextArea label="Your Submission" value={submissionText} onChange={e => { setSubmissionText(e.target.value); if (viewError) setViewError('') }} />
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                    <Button onClick={submitStudentAssignment} disabled={viewAssignment.submitted || submissionText.trim().length === 0}>Submit</Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </Modal>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Assignment' : 'New Assignment'} size="lg"
        actions={[
          <Button key="c" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>,
          <Button key="s" onClick={handleSubmit}>{editingId ? 'Update' : 'Create'}</Button>,
        ]}>
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <TextArea label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Class" value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} required options={classes.map(c => ({value: c.id, label: c.name}))} />
            <Select label="Term" value={form.term} onChange={e => setForm({...form, term: e.target.value})} required options={[{value:'1',label:'Term 1'},{value:'2',label:'Term 2'},{value:'3',label:'Term 3'}]} />
          </div>
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} required />
        </form>
      </Modal>
    </Layout>
  )
}
