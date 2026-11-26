import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, TextArea, PageHeader } from '../components/ui'
import { disciplineAPI, studentAPI } from '../api'

export default function Discipline() {
  const [records, setRecords] = useState([])
  const [events, setEvents] = useState([])
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ studentId: '', incident: '', action: '', severity: 'MINOR' })

  const load = async () => {
    const [r, e, s] = await Promise.all([
      disciplineAPI.getRecords(),
      disciplineAPI.getEvents(),
      studentAPI.getAll(),
    ])
    setRecords(r.data.data ?? [])
    setEvents(e.data.data ?? [])
    setStudents(s.data.data?.students ?? s.data.data ?? [])
  }

  useEffect(() => { load() }, [])

  return (
    <Layout>
      <PageHeader title="Discipline & Events" />
      <Card className="p-4 mb-6 space-y-3">
        <h3 className="font-semibold">Record incident</h3>
        <select className="w-full border rounded-lg p-2" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
          <option value="">Student</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </select>
        <TextArea label="Incident" value={form.incident} onChange={e => setForm({ ...form, incident: e.target.value })} />
        <Input label="Action taken" value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} />
        <Button onClick={async () => { await disciplineAPI.createRecord(form); load() }}>Save</Button>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Discipline records</h3>
          {records.map(r => (
            <div key={r.id} className="text-sm border-b py-2">
              <strong>{r.student?.fullName}</strong> — {r.severity}<br />
              <span className="text-slate-600">{r.incident}</span>
            </div>
          ))}
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">School events</h3>
          {events.map(e => (
            <div key={e.id} className="text-sm border-b py-2">
              <strong>{e.title}</strong> — {new Date(e.startDate).toLocaleDateString('en-KE')}
            </div>
          ))}
        </Card>
      </div>
    </Layout>
  )
}

