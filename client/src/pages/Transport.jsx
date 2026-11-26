import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, PageHeader } from '../components/ui'
import { transportAPI, studentAPI } from '../api'
import { Trash2, Plus } from 'lucide-react'

export default function Transport() {
  const [routes, setRoutes] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [routeForm, setRouteForm] = useState({ name: '', zone: '', fee: '' })
  const [assignForm, setAssignForm] = useState({ studentId: '', routeId: '', pickupPoint: '' })

  const load = async () => {
    try {
      setLoading(true)
      const [r, s] = await Promise.all([transportAPI.getRoutes(), studentAPI.getAll({ limit: 500 })])
      setRoutes(r.data.data ?? [])
      setStudents(Array.isArray(s.data?.data) ? s.data.data : s.data.data?.students ?? [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createRoute = async () => {
    try {
      if (!routeForm.name || !routeForm.zone || !routeForm.fee) {
        setError('All fields are required')
        return
      }
      await transportAPI.createRoute({
        ...routeForm,
        fee: Number(routeForm.fee),
      })
      setRouteForm({ name: '', zone: '', fee: '' })
      load()
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create route')
    }
  }

  const assignStudent = async () => {
    try {
      if (!assignForm.studentId || !assignForm.routeId || !assignForm.pickupPoint) {
        setError('All fields are required')
        return
      }
      await transportAPI.assignStudent({
        studentId: Number(assignForm.studentId),
        routeId: Number(assignForm.routeId),
        pickupPoint: assignForm.pickupPoint,
      })
      setAssignForm({ studentId: '', routeId: '', pickupPoint: '' })
      load()
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign student')
    }
  }

  return (
    <Layout>
      <PageHeader title="Transport Management" subtitle="Routes, drivers, vehicles & student assignments" />
      
      {error && (
        <Card className="p-4 mb-6 bg-red-50 border border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">New Transport Route</h3>
          </div>
          <div className="space-y-3">
            <Input
              label="Route Name"
              placeholder="e.g., North Route A"
              value={routeForm.name}
              onChange={e => setRouteForm({ ...routeForm, name: e.target.value })}
            />
            <Input
              label="Zone/Area"
              placeholder="e.g., Northlands, Kilimani"
              value={routeForm.zone}
              onChange={e => setRouteForm({ ...routeForm, zone: e.target.value })}
            />
            <Input
              label="Monthly Fee (KES)"
              type="number"
              placeholder="e.g., 5000"
              value={routeForm.fee}
              onChange={e => setRouteForm({ ...routeForm, fee: e.target.value })}
            />
            <Button onClick={createRoute} variant="primary" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Route'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-lg">Assign Student to Route</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Student</label>
              <select
                className="w-full px-3 py-2 border rounded text-sm"
                value={assignForm.studentId}
                onChange={e => setAssignForm({ ...assignForm, studentId: e.target.value })}
              >
                <option value="">Select student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.admissionNo})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Route</label>
              <select
                className="w-full px-3 py-2 border rounded text-sm"
                value={assignForm.routeId}
                onChange={e => setAssignForm({ ...assignForm, routeId: e.target.value })}
              >
                <option value="">Select route</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.zone})</option>
                ))}
              </select>
            </div>
            <Input
              label="Pickup Point"
              placeholder="e.g., Main Gate, School Gate"
              value={assignForm.pickupPoint}
              onChange={e => setAssignForm({ ...assignForm, pickupPoint: e.target.value })}
            />
            <Button onClick={assignStudent} variant="primary" disabled={loading} className="w-full">
              {loading ? 'Assigning...' : 'Assign Student'}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Transport Routes</h3>
        {routes.length === 0 ? (
          <p className="text-gray-500 text-sm">No routes created yet. Create one to get started.</p>
        ) : (
          <div className="space-y-2">
            {routes.map(r => (
              <div key={r.id} className="border rounded p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{r.name}</h4>
                    <p className="text-sm text-gray-600">
                      Zone: {r.zone} • Fee: KES {r.fee} • Students: {r.students?.length ?? 0}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Layout>
  )
}

