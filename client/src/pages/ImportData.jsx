import { useState } from 'react'
import Layout from '../components/Layout'
import { Card, Alert, PageHeader } from '../components/ui'
import { importAPI } from '../api'
import { Upload } from 'lucide-react'

export default function ImportData() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const importFile = async (type, file) => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = type === 'students'
        ? await importAPI.students(file)
        : await importAPI.teachers(file)
      setResult(data.data)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Import failed.')
    } finally { setLoading(false) }
  }

  return (
    <Layout>
      <PageHeader title="Import Data" subtitle="Upload Excel files to bulk-import records" />
      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      {result && (
        <Alert type="success" className="mb-4">
          Created {result.created} records. {result.errors?.length ? `${result.errors.length} errors.` : 'No errors.'}
        </Alert>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {['students', 'teachers'].map(type => (
          <Card key={type} className="p-6 space-y-4">
            <h3 className="font-semibold capitalize">{type}</h3>
            <p className="text-sm text-slate-500">
              {type === 'students'
                ? 'Columns: admissionno, fullname, gender, dob'
                : 'Columns: email, fullname, tscno, phone, subject'}
            </p>
            <label className="flex items-center gap-2 cursor-pointer text-brand-600 text-sm">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".xlsx,.xls" className="hidden" disabled={loading}
                onChange={e => importFile(type, e.target.files[0])} />
              {loading ? 'Importing…' : 'Choose Excel file'}
            </label>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
