import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, PageHeader, Alert, Modal } from '../components/ui'
import { examAPI, studentAPI } from '../api'
import { Trash2, Plus, FileText, TrendingUp } from 'lucide-react'

export default function Exams() {
  const [sessions, setSessions] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [showSessionForm, setShowSessionForm] = useState(false)
  const [showResultForm, setShowResultForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [selectedSessionForAnalysis, setSelectedSessionForAnalysis] = useState(null)

  const [sessionForm, setSessionForm] = useState({
    name: '',
    type: 'MOCK',
    year: new Date().getFullYear().toString(),
    term: '',
    subjects: '',
  })

  const [resultForm, setResultForm] = useState({
    studentId: '',
    sessionId: '',
    subjectName: '',
    score: '',
    grade: '',
  })

  const load = async () => {
    try {
      setLoading(true)
      const [sessResp, studentsResp] = await Promise.all([
        examAPI.getSessions(),
        studentAPI.getAll({ limit: 500 }),
      ])
      setSessions(sessResp.data?.data ?? [])
      setStudents(
        Array.isArray(studentsResp.data?.data)
          ? studentsResp.data.data
          : studentsResp.data?.data?.students ?? []
      )
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const createSession = async () => {
    try {
      if (!sessionForm.name) {
        setError('Session name is required')
        return
      }
      const subjects = sessionForm.subjects
        ? sessionForm.subjects.split(',').map((s) => s.trim()).filter(Boolean)
        : []

      await examAPI.createSession({
        name: sessionForm.name,
        type: sessionForm.type,
        year: Number(sessionForm.year),
        term: sessionForm.term || null,
        subjects,
      })
      setSessionForm({
        name: '',
        type: 'MOCK',
        year: new Date().getFullYear().toString(),
        term: '',
        subjects: '',
      })
      setShowSessionForm(false)
      setSuccess('Exam session created successfully')
      setTimeout(() => setSuccess(null), 3000)
      load()
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session')
    }
  }

  const recordResult = async () => {
    try {
      if (!resultForm.studentId || !resultForm.sessionId || !resultForm.subjectName || !resultForm.score) {
        setError('All fields are required')
        return
      }
      const score = Number(resultForm.score)
      if (score < 0 || score > 100) {
        setError('Score must be between 0 and 100')
        return
      }

      // Find or create the subject for this session
      const session = sessions.find((s) => s.id === Number(resultForm.sessionId))
      let subjectId = session?.subjects?.find((s) => s.name === resultForm.subjectName)?.id

      // If subject doesn't exist, we need to create it first
      if (!subjectId) {
        setError('Subject not found in this session. Please add subjects when creating the session.')
        return
      }

      await examAPI.recordResult({
        studentId: Number(resultForm.studentId),
        examSessionId: Number(resultForm.sessionId),
        examSubjectId: subjectId,
        score,
      })

      setResultForm({ studentId: '', sessionId: '', subjectName: '', score: '', grade: '' })
      setShowResultForm(false)
      setSuccess('Result recorded successfully')
      setTimeout(() => setSuccess(null), 3000)
      load()
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record result')
    }
  }

  const handleDeleteSession = async () => {
    try {
      // Note: Delete functionality needs to be implemented in the backend
      setError('Delete functionality is not yet implemented in the backend')
      setShowDeleteModal(false)
      setSessionToDelete(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete session')
    }
  }

  const viewAnalysis = async (sessionId) => {
    try {
      setLoading(true)
      const { data } = await examAPI.getAnalysis(sessionId)
      setAnalysisData(data.data ?? [])
      setSelectedSessionForAnalysis(sessions.find((s) => s.id === sessionId))
      setShowAnalysis(true)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }

  const calculateGrade = (score) => {
    if (score >= 80) return 'A'
    if (score >= 75) return 'A-'
    if (score >= 70) return 'B+'
    if (score >= 65) return 'B'
    if (score >= 60) return 'B-'
    if (score >= 55) return 'C+'
    if (score >= 50) return 'C'
    if (score >= 45) return 'C-'
    if (score >= 40) return 'D+'
    if (score >= 35) return 'D'
    return 'E'
  }

  const handleScoreChange = (e) => {
    const score = e.target.value
    setResultForm({
      ...resultForm,
      score,
      grade: score ? calculateGrade(Number(score)) : '',
    })
  }

  const handleSessionChange = (sessionId) => {
    setResultForm({ ...resultForm, sessionId, subjectName: '' })
  }

  const selectedSession = sessions.find((s) => s.id === Number(resultForm.sessionId))

  return (
    <Layout>
      <PageHeader title="Exam Management" subtitle="Mock and KCSE result tracking" />

      {error && (
        <Alert type="error" onClose={() => setError(null)} className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)} className="mb-6">
          {success}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Create Session Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Create Exam Session</h3>
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          {showSessionForm ? (
            <div className="space-y-3">
              <Input
                label="Session Name"
                placeholder="e.g., KCSE 2026, Mock 3"
                value={sessionForm.name}
                onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="w-full px-3 py-2 border rounded text-sm"
                    value={sessionForm.type}
                    onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value })}
                  >
                    <option value="MOCK">Mock</option>
                    <option value="KCSE">KCSE</option>
                    <option value="INTERNAL">Internal</option>
                  </select>
                </div>
                <Input
                  label="Year"
                  type="number"
                  value={sessionForm.year}
                  onChange={(e) => setSessionForm({ ...sessionForm, year: e.target.value })}
                />
              </div>
              <Input
                label="Term (optional)"
                placeholder="e.g., 1, 2, or 3"
                value={sessionForm.term}
                onChange={(e) => setSessionForm({ ...sessionForm, term: e.target.value })}
              />
              <Input
                label="Subjects (comma-separated)"
                placeholder="e.g., Mathematics, English, Kiswahili"
                value={sessionForm.subjects}
                onChange={(e) => setSessionForm({ ...sessionForm, subjects: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={createSession} variant="primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Session'}
                </Button>
                <Button onClick={() => setShowSessionForm(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowSessionForm(true)} variant="primary" className="w-full">
              New Session
            </Button>
          )}
        </Card>

        {/* Record Result Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Record Result</h3>
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          {showResultForm && sessions.length > 0 ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Session</label>
                <select
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={resultForm.sessionId}
                  onChange={(e) => handleSessionChange(e.target.value)}
                >
                  <option value="">Select session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.type})
                    </option>
                  ))}
                </select>
              </div>
              {selectedSession && selectedSession.subjects?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <select
                    className="w-full px-3 py-2 border rounded text-sm"
                    value={resultForm.subjectName}
                    onChange={(e) => setResultForm({ ...resultForm, subjectName: e.target.value })}
                  >
                    <option value="">Select subject</option>
                    {selectedSession.subjects.map((subj) => (
                      <option key={subj.id} value={subj.name}>
                        {subj.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={resultForm.studentId}
                  onChange={(e) => setResultForm({ ...resultForm, studentId: e.target.value })}
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo})
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Score (0-100)"
                type="number"
                min="0"
                max="100"
                value={resultForm.score}
                onChange={handleScoreChange}
              />
              {resultForm.grade && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <strong>Grade:</strong> {resultForm.grade}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={recordResult} variant="primary" disabled={loading}>
                  {loading ? 'Recording...' : 'Record'}
                </Button>
                <Button onClick={() => setShowResultForm(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowResultForm(true)}
              variant="primary"
              className="w-full"
              disabled={sessions.length === 0}
            >
              {sessions.length === 0 ? 'Create Session First' : 'New Result'}
            </Button>
          )}
        </Card>
      </div>

      {/* Sessions List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Exam Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No exam sessions yet. Create one to get started.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border rounded p-4 flex justify-between items-start hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{session.name}</h4>
                  <p className="text-sm text-gray-600">
                    {session.type} • Year {session.year}
                    {session.term && ` • Term ${session.term}`} • {session._count?.results ?? 0} results
                  </p>
                  {session.subjects?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Subjects: {session.subjects.map((s) => s.name).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => viewAnalysis(session.id)}
                    title="View Analysis"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setSessionToDelete(session)
                      setShowDeleteModal(true)
                    }}
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSessionToDelete(null)
        }}
        title="Delete Exam Session"
        actions={[
          <Button
            key="cancel"
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false)
              setSessionToDelete(null)
            }}
          >
            Cancel
          </Button>,
          <Button key="delete" variant="danger" onClick={handleDeleteSession}>
            Delete
          </Button>,
        ]}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the exam session "{sessionToDelete?.name}"? This action cannot be
          undone.
        </p>
      </Modal>

      {/* Analysis Modal */}
      <Modal
        isOpen={showAnalysis}
        onClose={() => {
          setShowAnalysis(false)
          setAnalysisData(null)
          setSelectedSessionForAnalysis(null)
        }}
        title={`Analysis: ${selectedSessionForAnalysis?.name}`}
        size="lg"
      >
        {analysisData && analysisData.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Class
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Mean Score
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Points
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Subjects
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysisData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm">{item.student?.fullName}</td>
                      <td className="px-4 py-2 text-sm">{item.student?.class?.name ?? 'N/A'}</td>
                      <td className="px-4 py-2 text-sm font-medium">
                        {item.meanScore?.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm">{item.totalPoints}</td>
                      <td className="px-4 py-2 text-sm">{item.subjects?.length ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No results recorded for this session yet.</p>
        )}
      </Modal>
    </Layout>
  )
}
