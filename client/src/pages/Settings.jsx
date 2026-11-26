import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Alert, PageHeader } from '../components/ui'
import { settingsAPI } from '../api'
import { Save, School } from 'lucide-react'

export default function Settings() {
  const [form, setForm] = useState({
    schoolName: '', address: '', phone: '', email: '',
    motto: '', county: '', logoUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data } = await settingsAPI.get()
      const s = data.data
      setForm({
        schoolName: s.schoolName ?? '',
        address:    s.address   ?? '',
        phone:      s.phone     ?? '',
        email:      s.email     ?? '',
        motto:      s.motto     ?? '',
        county:     s.county    ?? '',
        logoUrl:    s.logoUrl   ?? '',
      })
    } catch { setError('Failed to load settings.') }
    finally { setLoading(false) }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess(false)
    try {
      await settingsAPI.update(form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) { setError(err.response?.data?.message ?? 'Failed to save settings.') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="School Settings" subtitle="Configure your school's information" />

        {error   && <Alert type="error"   onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess(false)}>Settings saved successfully.</Alert>}

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <School className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">School Information</h2>
              <p className="text-xs text-slate-400">This information appears on report cards and official documents</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <Input label="School Name" required value={form.schoolName}
              onChange={e => setForm({...form, schoolName: e.target.value})}
              placeholder="e.g. Greenfield CBC Academy" />
            <Input label="School Motto" value={form.motto}
              onChange={e => setForm({...form, motto: e.target.value})}
              placeholder="e.g. Excellence Through Competence" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="County" value={form.county}
                onChange={e => setForm({...form, county: e.target.value})}
                placeholder="e.g. Uasin Gishu" />
              <Input label="Phone Number" value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="e.g. +254 700 000 000" />
            </div>
            <Input label="Email Address" type="email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="e.g. info@school.ac.ke" />
            <Input label="Physical Address" value={form.address}
              onChange={e => setForm({...form, address: e.target.value})}
              placeholder="e.g. P.O Box 100-30100, Eldoret" />
            <Input label="Logo URL (optional)" value={form.logoUrl}
              onChange={e => setForm({...form, logoUrl: e.target.value})}
              placeholder="https://your-school.com/logo.png"
              hint="Paste a public URL to your school logo. It will appear on report cards." />

            {form.logoUrl && (
              <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl border border-surface-200">
                <img src={form.logoUrl} alt="Logo preview"
                  className="w-12 h-12 rounded-lg object-contain border border-surface-200"
                  onError={e => e.target.style.display = 'none'} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{form.schoolName || 'School Name'}</p>
                  {form.motto && <p className="text-xs text-slate-400 italic">{form.motto}</p>}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
