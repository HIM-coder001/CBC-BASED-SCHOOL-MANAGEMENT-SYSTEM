import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, Modal, Alert, PageHeader } from '../components/ui'
import { userAPI, authAPI } from '../api'
import { Plus, Key, Trash2, CheckCircle } from 'lucide-react'

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']

const ROLE_COLORS = {
  ADMIN:   'bg-red-100 text-red-700',
  TEACHER: 'bg-blue-100 text-blue-700',
  STUDENT: 'bg-green-100 text-green-700',
  PARENT:  'bg-purple-100 text-purple-700',
}

export default function Users() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Create modal
  const [showCreate, setShowCreate]   = useState(false)
  const [form, setForm]               = useState({ fullName: '', email: '', password: '', role: 'TEACHER' })
  const [createError, setCreateError] = useState('')
  const [creating, setCreating]       = useState(false)

  // Reset password modal
  const [resetUser, setResetUser]   = useState(null)
  const [newPw, setNewPw]           = useState('')
  const [resetError, setResetError] = useState('')
  const [resetDone, setResetDone]   = useState(false)
  const [resetting, setResetting]   = useState(false)

  // Delete confirm
  const [deleteId, setDeleteId]   = useState(null)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      const { data } = await userAPI.getAll()
      setUsers(data.data ?? [])
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  const flash = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // ── Create ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setForm({ fullName: '', email: '', password: '', role: 'TEACHER' })
    setCreateError('')
    setShowCreate(true)
  }

  const handleCreate = async (e) => {
    e?.preventDefault()
    if (!form.fullName || !form.email || !form.password) {
      setCreateError('All fields are required.')
      return
    }
    if (form.password.length < 6) {
      setCreateError('Password must be at least 6 characters.')
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      await userAPI.create(form)
      setShowCreate(false)
      flash('User created successfully.')
      load()
    } catch (err) {
      setCreateError(err.response?.data?.message ?? 'Failed to create user.')
    } finally {
      setCreating(false)
    }
  }

  // ── Reset password ───────────────────────────────────────────────────────
  const openReset = (user) => {
    setResetUser(user)
    setNewPw('')
    setResetError('')
    setResetDone(false)
  }

  const handleReset = async () => {
    if (!newPw) { setResetError('Please enter a new password.'); return }
    if (newPw.length < 6) { setResetError('Password must be at least 6 characters.'); return }
    setResetting(true)
    setResetError('')
    try {
      await authAPI.adminResetPassword(resetUser.id, newPw)
      setResetDone(true)
    } catch (err) {
      setResetError(err.response?.data?.message ?? 'Reset failed.')
    } finally {
      setResetting(false)
    }
  }

  const closeReset = () => {
    if (resetDone) flash(`Password reset for ${resetUser?.fullName}.`)
    setResetUser(null)
    setResetDone(false)
    setNewPw('')
    setResetError('')
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await userAPI.delete(deleteId)
      setDeleteId(null)
      flash('User deleted.')
      load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to delete user.')
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <PageHeader
          title="Users"
          subtitle="Manage system accounts"
          actions={
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" />Add User
            </Button>
          }
        />
      </div>

      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      <Card>
        {loading ? (
          <p className="p-6 text-slate-500 text-center">Loading…</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-slate-400 text-center">No users found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500 bg-slate-50">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Created</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{u.fullName}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-KE')}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="secondary" size="sm" onClick={() => openReset(u)}>
                        <Key className="w-3 h-3" />Reset PW
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteId(u.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Create user modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="New User"
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating…' : 'Create User'}
            </Button>
          </>
        }
      >
        <form className="space-y-3" onSubmit={handleCreate}>
          {createError && <Alert type="error">{createError}</Alert>}
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <Select
            label="Role"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            options={ROLES.map(r => ({ value: r, label: r }))}
          />
        </form>
      </Modal>

      {/* Reset password modal */}
      <Modal
        isOpen={!!resetUser}
        onClose={closeReset}
        title="Reset Password"
        actions={
          resetDone ? (
            <Button onClick={closeReset}>Done</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={closeReset}>Cancel</Button>
              <Button onClick={handleReset} disabled={resetting}>
                {resetting ? 'Resetting…' : 'Reset Password'}
              </Button>
            </>
          )
        }
      >
        {resetDone ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-slate-700 font-medium">Password reset successfully</p>
            <p className="text-slate-500 text-sm text-center">
              The password for <strong>{resetUser?.fullName}</strong> has been updated.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Set a new password for <strong>{resetUser?.fullName}</strong> ({resetUser?.email}).
            </p>
            {resetError && <Alert type="error">{resetError}</Alert>}
            <Input
              label="New Password"
              type="password"
              placeholder="Min. 6 characters"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
            />
          </div>
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete User"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-slate-600 text-sm">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
      </Modal>
    </Layout>
  )
}
