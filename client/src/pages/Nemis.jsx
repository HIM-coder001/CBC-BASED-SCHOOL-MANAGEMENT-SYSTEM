import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, PageHeader } from '../components/ui'
import { nemisAPI, studentAPI, teacherAPI } from '../api'
import { Download, Settings } from 'lucide-react'


const download = (blob, name) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export default function Nemis() {
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [upiForm, setUpiForm] = useState({ studentId: '', upi: '' })
  const [showUpiForm, setShowUpiForm] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [s, t] = await Promise.all([
        studentAPI.getAll({ limit: 500 }),
        teacherAPI.getAll()
      ])
      setStudents(Array.isArray(s.data?.data) ? s.data.data : s.data?.data?.students ?? [])
      setTeachers(t.data?.data ?? [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleExportStudents = async () => {
    try {
      setLoading(true)
      const { data } = await nemisAPI.exportStudents()
      download(data, `nemis-students-${new Date().toISOString().split('T')[0]}.json`)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export students')
    } finally {
      setLoading(false)
    }
  }

  const handleExportTeachers = async () => {
    try {
      setLoading(true)
      const { data } = await nemisAPI.exportTeachers()
      download(data, `nemis-teachers-${new Date().toISOString().split('T')[0]}.json`)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export teachers')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUpi = async () => {
    try {
      if (!upiForm.studentId || !upiForm.upi) {
        setError('Please select a student and enter UPI')
        return
      }
      await nemisAPI.updateUpi({
        studentId: Number(upiForm.studentId),
        upi: upiForm.upi.toUpperCase(),
      })
      setUpiForm({ studentId: '', upi: '' })
      setShowUpiForm(false)
      load()
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update UPI')
    }
  }

  return (
    <Layout>
      <PageHeader
        title="NEMIS Integration"
        subtitle="Export student and teacher data for Ministry registration"
      />

      {error && (
        <Card className="p-4 mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <Download className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-lg">Export Students</h3>
          <p className="text-sm text-slate-600">
            Download student list with admission numbers, NEMIS UPI, class, and parent contact details
          </p>
          <div className="text-xs text-slate-500">
            Total students: {students.length}
          </div>
          <Button
            onClick={handleExportStudents}
            variant="primary"
            disabled={loading || students.length === 0}
            className="w-full"
          >
            {loading ? 'Exporting...' : 'Export Students (JSON)'}
          </Button>
        </Card>

        <Card className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <Download className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg">Export Teachers</h3>
          <p className="text-sm text-slate-600">
            Download teacher list with TSC numbers, qualifications, and assigned subjects
          </p>
          <div className="text-xs text-slate-500">
            Total teachers: {teachers.length}
          </div>
          <Button
            onClick={handleExportTeachers}
            variant="primary"
            disabled={loading || teachers.length === 0}
            className="w-full"
          >
            {loading ? 'Exporting...' : 'Export Teachers (JSON)'}
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Student NEMIS UPI Management
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Manage unique personal identifiers for NEMIS compliance
            </p>
          </div>
          <Button
            onClick={() => setShowUpiForm(!showUpiForm)}
            variant={showUpiForm ? 'secondary' : 'primary'}
          >
            {showUpiForm ? 'Close' : 'Update UPI'}
          </Button>
        </div>

        {showUpiForm && (
          <div className="border-t pt-4 mb-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Select Student</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={upiForm.studentId}
                  onChange={e => setUpiForm({ ...upiForm, studentId: e.target.value })}
                >
                  <option value="">Select student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} - {s.admissionNo}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="NEMIS UPI"
                placeholder="Enter 12-digit UPI"
                value={upiForm.upi}
                onChange={e => setUpiForm({ ...upiForm, upi: e.target.value })}
                maxLength="12"
              />
              <div className="flex gap-2">
                <Button onClick={handleUpdateUpi} variant="primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update UPI'}
                </Button>
                <Button onClick={() => setShowUpiForm(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-700">
          <strong>Note:</strong> NEMIS UPI is required by the Ministry of Education for student identification. Ensure all students have valid UPIs before export.
        </div>
      </Card>
    </Layout>
  )
}

