import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api'
import { Button, Input, Alert } from '../components/ui'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMsg('')

    const nextPassword = password?.trim()
    if (!nextPassword) {
      setError('Password is required.')
      return
    }
    if (nextPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (nextPassword !== confirmPassword?.trim()) {
      setError('Passwords do not match.')
      return
    }

    try {
      await authAPI.resetPassword(token, nextPassword)
      setMsg('Password updated. You can now sign in.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Reset failed.')
    }
  }


  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-slate-600 mb-4">Invalid reset link.</p>
          <Link to="/login" className="text-brand-600">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 max-w-md w-full space-y-4">
        <h1 className="text-xl font-bold">Reset Password</h1>
        {error && <Alert type="error">{error}</Alert>}
        {msg && <Alert type="success">{msg}</Alert>}
        <Input label="New password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Input label="Confirm password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <Button type="submit" className="w-full">Update password</Button>

      </form>
    </div>
  )
}
