import { useState, useEffect, useMemo } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, TextArea, Modal, Alert, EmptyState, SkeletonTable, PageHeader, Badge, ConfirmModal } from '../components/ui'
import apiClient from '../api'
import { useAuthStore } from '../store'
import { Users, Plus, Edit2, Trash2, Search } from 'lucide-react'

const PROFILE_CATEGORIES = [
  { value: 'COMMUNICATION', label: 'Communication' },
  { value: 'CRITICAL_THINKING', label: 'Critical Thinking' },
  { value: 'CREATIVITY', label: 'Creativity' },
  { value: 'CITIZENSHIP', label: 'Citizenship' },
  { value: 'DIGITAL_LITERACY', label: 'Digital Literacy' },
  { value: 'SELF_MANAGEMENT', label: 'Self Management' },
]

const PROFILE_LEVELS = [
  { value: 'BEGINNING', label: 'Beginning' },
  { value: 'DEVELOPING', label: 'Developing' },
  { value: 'PROFICIENT', label: 'Proficient' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'MASTERED', label: 'Mastered' },
]

const EMPTY_FORM = {
  studentId: '',
  term: '1',
  year: new Date().getFullYear().toString(),
  category: '',
  level: 'DEVELOPING',
  comments: '',
}

export default function LearnerProfiles() {
  const { user } = useAuthStore()
  const canEdit = ['ADMIN', 'TEACHER'].includes(user?.role)
  const isStudent = user?.role === 'STUDENT'

  const [profiles, setProfiles] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [modalError, setModalError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [filterStudentId, setFilterStudentId] = useState('')
  const [filterTerm, setFilterTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchProfiles()
    if (canEdit) fetchStudents()
  }, [user])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filterStudentId) params.studentId = filterStudentId
      if (filterTerm) params.term = filterTerm
      if (filterYear) params.year = filterYear
      if (isStudent) {
        const { data: me } = await apiClient.get('/students/me')
        if (me?.data?.id) params.studentId = me.data.id
      }
      const { data } = await apiClient.get('/learner-profiles', { params })
      setProfiles(data.data?.profiles ?? data.data ?? [])
    } catch {
      setError('Failed to load learner profiles.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const { data } = await apiClient.get('/students')
      setStudents(data.data?.students ?? data.data ?? [])
    } catch (err) {
      // Ignore student fetch errors; learner profiles can still load.
    }
  }


  const openModal = (profile = null) => {
    setModalError('')
    if (profile) {
      setEditingId(profile.id)
      setForm({
        studentId: profile.studentId || '',
        term: profile.term,
        year: profile.year,
        category: profile.category,
        level: profile.level,
        comments: profile.comments || '',
      })
    } else {
      setEditingId(null)
      setForm(EMPTY_FORM)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setModalError('')
    try {
      const payload = { ...form }
      if (editingId) await apiClient.put(`/learner-profiles/${editingId}`, payload)
      else await apiClient.post('/learner-profiles', payload)
      setShowModal(false)
      fetchProfiles()
    } catch (err) {
      setModalError(err.response?.data?.message ?? 'Failed to save learner profile.')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await apiClient.delete(`/learner-profiles/${deleteId}`)
      setDeleteId(null)
      fetchProfiles()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to delete learner profile.')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles
    const q = search.toLowerCase()
    return profiles.filter(p =>
      p.student?.fullName?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.comments?.toLowerCase().includes(q)
    )
  }, [profiles, search])

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Learner Profiles"
          subtitle="Track CBC dispositions and learner traits"
          actions={canEdit && <Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Profile</Button>}
        />

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <Card>
          <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 items-end mb-4`}>
            {canEdit && (
              <Select
                label="Student"
                value={filterStudentId}
                onChange={e => setFilterStudentId(e.target.value)}
                options={[{ value: '', label: 'All students' }, ...students.map(s => ({ value: s.id, label: s.fullName }))]}
              />
            )}

            <Select
              label="Term"
              value={filterTerm}
              onChange={e => setFilterTerm(e.target.value)}
              options={[
                { value: '', label: 'All terms' },
                { value: '1', label: 'Term 1' },
                { value: '2', label: 'Term 2' },
                { value: '3', label: 'Term 3' },
              ]}
            />

            <Input
              label="Year"
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              placeholder="2026"
            />

            <div className="relative xl:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by student, category, or comments…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-9 w-full"
              />
            </div>

            <div className="flex flex-wrap gap-2 xl:col-span-1 justify-end">
              <Button variant="secondary" onClick={() => { setFilterStudentId(''); setFilterTerm(''); setFilterYear(''); setSearch(''); fetchProfiles() }}>
                Reset
              </Button>
              <Button onClick={fetchProfiles}>Apply</Button>
            </div>
          </div>

          {loading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No learner profile data"
              description={canEdit ? 'Add learners profile entries to track CBC dispositions.' : 'No learner profiles have been recorded yet.'}
              action={canEdit && <Button onClick={() => openModal()}><Plus className="w-4 h-4" />Add Profile</Button>}
            />
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Level</th>
                    <th>Student</th>
                    <th>Term</th>
                    <th>Year</th>
                    <th>Comments</th>
                    {canEdit && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(profile => (
                    <tr key={profile.id}>
                      <td>{PROFILE_CATEGORIES.find(item => item.value === profile.category)?.label || profile.category}</td>
                      <td><Badge variant={profile.level === 'MASTERED' ? 'success' : profile.level === 'ADVANCED' ? 'info' : profile.level === 'PROFICIENT' ? 'brand' : 'warning'}>{profile.level}</Badge></td>
                      <td>{profile.student?.fullName ?? `#${profile.studentId}`}</td>
                      <td>Term {profile.term}</td>
                      <td>{profile.year}</td>
                      <td className="max-w-[280px] text-slate-500 truncate">{profile.comments || '—'}</td>
                      {canEdit && (
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openModal(profile)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteId(profile.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Learner Profile' : 'Add Learner Profile'}
        actions={[
          <Button key="cancel" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>,
          <Button key="save" onClick={handleSubmit}>{editingId ? 'Update' : 'Create'}</Button>,
        ]}
      >
        {modalError && <Alert type="error" className="mb-4">{modalError}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Student"
              value={form.studentId}
              onChange={e => setForm({ ...form, studentId: e.target.value })}
              required
              options={students.map(s => ({ value: s.id, label: s.fullName }))}
            />
            <Select
              label="Category"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              required
              options={PROFILE_CATEGORIES}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Level"
              value={form.level}
              onChange={e => setForm({ ...form, level: e.target.value })}
              required
              options={PROFILE_LEVELS}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Term" value={form.term} onChange={e => setForm({ ...form, term: e.target.value })} required />
              <Input label="Year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required />
            </div>
          </div>
          <TextArea
            label="Comments"
            value={form.comments}
            onChange={e => setForm({ ...form, comments: e.target.value })}
            placeholder="Describe the learner's strengths or areas for development…"
          />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Profile Entry"
        message="This will remove this learner profile entry."
      />
    </Layout>
  )
}
