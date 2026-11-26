import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { authAPI } from '../api'
import { Loader2, GraduationCap, Eye, EyeOff } from 'lucide-react'

const DEMO = [
  { role: 'Admin',   email: 'admin@school.com',   color: 'bg-brand-500' },
  { role: 'Teacher', email: 'teacher@school.com', color: 'bg-emerald-500' },
  { role: 'Student', email: 'student@school.com', color: 'bg-amber-500' },
  { role: 'Parent',  email: 'parent@school.com',  color: 'bg-rose-500' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.login(email, password)
      login(data.data.user, data.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const loginAsDemo = async (demoEmail) => {
    setError('')
    setLoading(true)
    setEmail(demoEmail)
    setPassword('password')
    try {
      const { data } = await authAPI.login(demoEmail, 'password')
      login(data.data.user, data.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed. Make sure the server is running and seeded.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-lg">SchoolHub</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Competency Based<br />Curriculum Management
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            A unified platform for Kenyan CBC schools — manage students, track competencies, generate report cards, and keep parents informed.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Students', value: '500+' },
              { label: 'Teachers', value: '40+' },
              { label: 'Classes', value: '20+' },
              { label: 'Reports', value: '1000+' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-brand-400">{s.value}</p>
                <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-sm">© 2026 SchoolHub. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">SchoolHub</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-1 text-sm">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <span className="w-4 h-4 shrink-0">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.com"
                required
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            <button type="button" className="text-brand-600 hover:underline" onClick={async () => {
              if (!email) { setError('Enter your email first.'); return }
              try {
                await authAPI.forgotPassword(email)
                setError('')
                alert('If that email exists, reset instructions were sent.')
              } catch { setError('Could not send reset email.') }
            }}>Forgot password?</button>
          </p>

          {/* Demo credentials */}
          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick demo access</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map(d => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => loginAsDemo(d.email)}
                  disabled={loading}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-surface-200 bg-white hover:border-brand-300 hover:shadow-soft transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`w-7 h-7 ${d.color} rounded-lg flex items-center justify-center shrink-0`}>
                    <span className="text-white text-xs font-bold">{d.role[0]}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-brand-600">{d.role}</p>
                    <p className="text-xs text-slate-400 truncate" style={{ maxWidth: 110 }}>{d.email}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Password for all: <code className="bg-surface-100 px-1.5 py-0.5 rounded font-mono">password</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}
