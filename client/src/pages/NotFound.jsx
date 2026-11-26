import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl font-black text-brand-300">?</span>
        </div>
        <h1 className="text-6xl font-black text-slate-200 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-3">Page not found</h2>
        <p className="text-slate-400 text-sm mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

        <Link to="/" className="btn-primary inline-flex">Go back home</Link>
      </div>
    </div>
  )
}
