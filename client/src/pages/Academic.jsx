import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, PageHeader, Alert, Badge } from '../components/ui'
import { academicAPI } from '../api'

export default function Academic() {
  const [years, setYears] = useState([])
  const [yearForm, setYearForm] = useState({ year: '2026', isCurrent: true })
  const [termForm, setTermForm] = useState({ name: 'Term 2', startDate: '', endDate: '', academicYearId: '' })
  const [msg, setMsg] = useState('')

  const load = () => academicAPI.getYears().then(r => {
    setYears(r.data.data ?? [])
    if (r.data.data?.[0]) setTermForm(f => ({ ...f, academicYearId: String(r.data.data[0].id) }))
  })

  useEffect(() => { load() }, [])

  const addYear = async () => {
    await academicAPI.createYear({ year: Number(yearForm.year), isCurrent: yearForm.isCurrent })
    setMsg('Academic year added')
    load()
  }

  const addTerm = async () => {
    await academicAPI.createTerm({ ...termForm, academicYearId: Number(termForm.academicYearId) })
    setMsg('Term added')
    load()
  }

  const lockTerm = async (id) => {
    await academicAPI.lockTerm(id)
    setMsg('Term locked — marks entry disabled')
    load()
  }

  return (
    <Layout>
      <PageHeader title="Academic Calendar" subtitle="Manage years and terms" />
      {msg && <Alert type="success" className="mb-4" onClose={() => setMsg('')}>{msg}</Alert>}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Add academic year</h3>
          <Input label="Year" value={yearForm.year} onChange={e => setYearForm({ ...yearForm, year: e.target.value })} />
          <Button onClick={addYear}>Add year</Button>
        </Card>
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Add term</h3>
          <Input label="Name" value={termForm.name} onChange={e => setTermForm({ ...termForm, name: e.target.value })} />
          <Input label="Start" type="date" value={termForm.startDate} onChange={e => setTermForm({ ...termForm, startDate: e.target.value })} />
          <Input label="End" type="date" value={termForm.endDate} onChange={e => setTermForm({ ...termForm, endDate: e.target.value })} />
          <Button onClick={addTerm}>Add term</Button>
        </Card>
      </div>
      <Card className="p-4 mt-6">
        <h3 className="font-semibold mb-3">Terms</h3>
        {years.map(y => (
          <div key={y.id} className="mb-4">
            <p className="font-medium">{y.year} {y.isCurrent && <Badge>Current</Badge>}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {y.terms?.map(t => (
                <li key={t.id} className="flex justify-between items-center py-1 border-b">
                  <span>{t.name} ({t.startDate?.slice(0,10)} – {t.endDate?.slice(0,10)}) {t.isLocked && <Badge variant="warning">Locked</Badge>}</span>
                  {!t.isLocked && <Button size="sm" variant="secondary" onClick={() => lockTerm(t.id)}>Lock</Button>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Card>
    </Layout>
  )
}

