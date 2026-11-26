import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, PageHeader, Alert } from '../components/ui'
import { timetableAPI, classAPI, teacherAPI } from '../api'

const DAYS = ['Mon','Tue','Wed','Thu','Fri']

export default function Timetable() {
  const [slots, setSlots] = useState([])
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [filterClass, setFilterClass] = useState('')
  const [form, setForm] = useState({ dayOfWeek: 1, period: 1, classId: '', teacherId: '', subjectId: '', room: '' })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [s, sub, c, t] = await Promise.all([
        timetableAPI.get(filterClass ? { classId: filterClass } : {}),
        timetableAPI.getSubjects(),
        classAPI.getAll(),
        teacherAPI.getAll(),
      ])
      setSlots(Array.isArray(s.data.data) ? s.data.data : [])
      setSubjects(Array.isArray(sub.data.data) ? sub.data.data : [])
      setClasses(Array.isArray(c.data.data) ? c.data.data : [])
      setTeachers(Array.isArray(t.data.data) ? t.data.data : [])
    } catch (err) {
      setError('Failed to load timetable data')
    }
  }

  useEffect(() => { load().catch(() => setError('Failed to load')) }, [filterClass])

  const addSlot = async () => {
    try {
      await timetableAPI.createSlot({ ...form, dayOfWeek: Number(form.dayOfWeek), period: Number(form.period), classId: Number(form.classId), teacherId: Number(form.teacherId), subjectId: Number(form.subjectId) })
      load()
    } catch (err) { setError(err.response?.data?.message ?? 'Conflict or error') }
  }

  return (
    <Layout>
      <PageHeader title="Timetable" subtitle="Class schedules" />
      {error && <Alert type="error" className="mb-4">{error}</Alert>}
      <Card className="p-4 mb-4 grid md:grid-cols-3 gap-3">
        <Select label="Filter class" value={filterClass} onChange={e => setFilterClass(e.target.value)}
          options={[{ value: '', label: 'All' }, ...classes.map(c => ({ value: c.id, label: c.name }))]} />
        <Select label="Class" value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}
          options={classes.map(c => ({ value: c.id, label: c.name }))} />
        <Select label="Teacher" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}
          options={teachers.map(t => ({ value: t.id, label: t.fullName }))} />
        <Select label="Subject" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
          options={subjects.map(s => ({ value: s.id, label: s.name }))} />
        <Input label="Day (1=Mon)" type="number" min={1} max={5} value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })} />
        <Input label="Period" type="number" min={1} value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
        <Input label="Room" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
        <Button onClick={addSlot} className="self-end">Add slot</Button>
      </Card>
      <Card>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b"><th className="p-2">Day</th><th className="p-2">P</th><th className="p-2">Class</th><th className="p-2">Subject</th><th className="p-2">Teacher</th><th /></tr></thead>
          <tbody>
            {slots.map(s => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{DAYS[s.dayOfWeek - 1]}</td>
                <td className="p-2">{s.period}</td>
                <td className="p-2">{s.class?.name}</td>
                <td className="p-2">{s.subject?.name}</td>
                <td className="p-2">{s.teacher?.fullName}</td>
                <td className="p-2"><Button size="sm" variant="secondary" onClick={() => timetableAPI.deleteSlot(s.id).then(load)}>Delete</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Layout>
  )
}
