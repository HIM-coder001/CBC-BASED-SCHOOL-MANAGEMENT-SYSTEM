import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, TextArea, PageHeader, Badge } from '../components/ui'
import { tpadAPI, teacherAPI } from '../api'
import { useAuthStore } from '../store'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export default function Tpad() {
  const { user } = useAuthStore()
  const [submissions, setSubmissions] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    term: '1',
    year: new Date().getFullYear().toString(),
    teacherId: '',
    overallRating: '',
    comments: '',
    status: 'DRAFT'
  })

  const TERMS = ['1', '2', '3']
  const RATINGS = ['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Needs Improvement']

  const load = async () => {
    try {
      setLoading(true)
      const [subs, teachersRes] = await Promise.all([
        tpadAPI.getAll({ term: form.term, year: form.year }),
        user?.role === 'ADMIN' ? teacherAPI.getAll() : Promise.resolve({ data: { data: [] } })
      ])
      setSubmissions(subs.data?.data ?? [])
      setTeachers(teachersRes.data?.data ?? [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [form.term, form.year])

  const save = async () => {
    try {
      if (!form.overallRating) {
        setError('Overall rating is required')
        return
      }
      await tpadAPI.save({
        term: form.term,
        year: Number(form.year),
        teacherId: user?.role === 'ADMIN' ? Number(form.teacherId) : null,
        overallRating: form.overallRating,
        comments: form.comments,
        status: form.status
      })
      load()
      setForm({
        term: form.term,
        year: form.year,
        teacherId: '',
        overallRating: '',
        comments: '',
        status: 'DRAFT'
      })
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appraisal')
    }
  }

  const handleSubmit = async () => {
    await tpadAPI.save({
      ...form,
      year: Number(form.year),
      status: 'SUBMITTED'
    })
    load()
  }

  const handleReview = async (id, approved) => {
    try {
      await tpadAPI.review(id, { status: approved ? 'APPROVED' : 'REJECTED' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review appraisal')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-600" />
      case 'SUBMITTED': return <Clock className="w-4 h-4 text-yellow-600" />
      default: return null
    }
  }

  return (
    <Layout>
      <PageHeader
        title="TPAD - Teacher Performance Appraisal"
        subtitle="Annual performance evaluation and review"
      />

      {error && (
        <Card className="p-4 mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      {user?.role === 'TEACHER' && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Submit Your Appraisal</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Term</label>
                <select
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={form.term}
                  onChange={e => setForm({ ...form, term: e.target.value })}
                >
                  {TERMS.map(t => <option key={t} value={t}>Term {t}</option>)}
                </select>
              </div>
              <Input
                label="Year"
                type="number"
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Overall Rating</label>
              <select
                className="w-full px-3 py-2 border rounded text-sm"
                value={form.overallRating}
                onChange={e => setForm({ ...form, overallRating: e.target.value })}
              >
                <option value="">Select rating</option>
                {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <TextArea
              label="Comments"
              rows={4}
              placeholder="Provide additional comments about your performance and achievements this term"
              value={form.comments}
              onChange={e => setForm({ ...form, comments: e.target.value })}
            />

            <div className="flex gap-2">
              <Button onClick={save} variant="secondary" disabled={loading}>
                {loading ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {user?.role === 'ADMIN' && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create Appraisal</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Teacher</label>
                <select
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={form.teacherId}
                  onChange={e => setForm({ ...form, teacherId: e.target.value })}
                >
                  <option value="">Select teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Term</label>
                <select
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={form.term}
                  onChange={e => setForm({ ...form, term: e.target.value })}
                >
                  {TERMS.map(t => <option key={t} value={t}>Term {t}</option>)}
                </select>
              </div>
              <Input
                label="Year"
                type="number"
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Overall Rating</label>
              <select
                className="w-full px-3 py-2 border rounded text-sm"
                value={form.overallRating}
                onChange={e => setForm({ ...form, overallRating: e.target.value })}
              >
                <option value="">Select rating</option>
                {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <TextArea
              label="Comments"
              rows={4}
              placeholder="Administrative comments"
              value={form.comments}
              onChange={e => setForm({ ...form, comments: e.target.value })}
            />

            <Button onClick={save} disabled={loading} className="w-full">
              {loading ? 'Saving...' : 'Save Appraisal'}
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Appraisals</h3>
        {submissions.length === 0 ? (
          <p className="text-gray-500 text-sm">No appraisals for this term. {user?.role === 'TEACHER' && 'Submit yours above.'}</p>
        ) : (
          <div className="space-y-3">
            {submissions.map(sub => (
              <div key={sub.id} className="border rounded p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{sub.teacher?.fullName || 'N/A'}</h4>
                    <p className="text-sm text-gray-600">
                      Term {sub.term} {sub.year} • Rating: {sub.overallRating}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(sub.status)}
                    <Badge>{sub.status}</Badge>
                  </div>
                </div>
                {sub.comments && (
                  <p className="text-sm text-gray-700 mb-2">{sub.comments}</p>
                )}
                {user?.role === 'ADMIN' && sub.status === 'SUBMITTED' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleReview(sub.id, true)}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleReview(sub.id, false)}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  )
}

