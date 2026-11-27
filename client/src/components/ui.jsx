import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Loader2 } from 'lucide-react'

/* ─── Button ─────────────────────────────────────────────────────────────── */
export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const v = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'btn-ghost',
    outline:   'btn btn-secondary',
  }
  const s = { sm: 'btn-sm', md: '', lg: 'btn-lg' }
  return (
    <button className={`${v[variant] ?? v.primary} ${s[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

/* ─── Card ───────────────────────────────────────────────────────────────── */
export function Card({ children, className = '', ...props }) {
  return <div className={`card ${className}`} {...props}>{children}</div>
}

/* ─── Badge ──────────────────────────────────────────────────────────────── */
export function Badge({ children, variant = 'gray', className = '' }) {
  const v = {
    success: 'badge-success', warning: 'badge-warning', danger: 'badge-danger',
    info: 'badge-info', purple: 'badge-purple', brand: 'badge-brand', gray: 'badge-gray',
  }
  return <span className={`badge ${v[variant] ?? v.gray} ${className}`}>{children}</span>
}

/* ─── Input ──────────────────────────────────────────────────────────────── */
export function Input({ label, error, required, hint, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input className={`input-field ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`} {...props} />
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

/* ─── Select ─────────────────────────────────────────────────────────────── */
export function Select({ label, options = [], error, required, placeholder = 'Select…', className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select className={`input-field ${error ? 'border-red-400' : ''} ${className}`} {...props}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

/* ─── TextArea ───────────────────────────────────────────────────────────── */
export function TextArea({ label, error, required, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea className={`input-field resize-y min-h-[80px] ${error ? 'border-red-400' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */
export function Modal({ isOpen, onClose, title, children, actions, size = 'md' }) {
  if (!isOpen) return null
  const widths = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white w-full ${widths[size]} rounded-t-2xl sm:rounded-2xl shadow-modal max-h-[92vh] sm:max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-surface-200 shrink-0">
          <h2 className="text-base font-semibold text-slate-800 truncate pr-4">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-surface-100 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex-1">{children}</div>
        {/* Footer */}
        {actions && (
          <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-surface-200 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Alert ──────────────────────────────────────────────────────────────── */
export function Alert({ type = 'info', children, onClose }) {
  const cfg = {
    success: { cls: 'bg-emerald-50 border-emerald-200 text-emerald-800', Icon: CheckCircle },
    error:   { cls: 'bg-red-50 border-red-200 text-red-800',             Icon: AlertCircle },
    warning: { cls: 'bg-amber-50 border-amber-200 text-amber-800',       Icon: AlertTriangle },
    info:    { cls: 'bg-blue-50 border-blue-200 text-blue-800',          Icon: Info },
  }
  const { cls, Icon } = cfg[type] ?? cfg.info
  return (
    <div className={`flex items-start gap-3 border rounded-xl p-4 text-sm ${cls}`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span className="flex-1">{children}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-surface-200 rounded-lg ${className}`} />
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ─── LoadingSpinner ─────────────────────────────────────────────────────── */
export function LoadingSpinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 className={`${s[size]} text-brand-600 animate-spin`} />
    </div>
  )
}

/* ─── EmptyState ─────────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ─── StatCard ───────────────────────────────────────────────────────────── */
export function StatCard({ title, value, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand:   { bg: 'bg-brand-50',   icon: 'bg-brand-100   text-brand-600',   text: 'text-brand-700'   },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700' },
    amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100   text-amber-600',   text: 'text-amber-700'   },
    violet:  { bg: 'bg-violet-50',  icon: 'bg-violet-100  text-violet-600',  text: 'text-violet-700'  },
    rose:    { bg: 'bg-rose-50',    icon: 'bg-rose-100    text-rose-600',    text: 'text-rose-700'    },
    orange:  { bg: 'bg-orange-50',  icon: 'bg-orange-100  text-orange-600',  text: 'text-orange-700'  },
  }
  const c = colors[color] ?? colors.brand
  return (
    <div className={`card flex items-center gap-3 ${c.bg}`}>
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{title}</p>
        <p className={`text-xl md:text-2xl font-bold mt-0.5 ${c.text}`}>{value}</p>
        {trend && <p className="text-xs text-slate-400 mt-0.5 truncate">{trend}</p>}
      </div>
    </div>
  )
}

/* ─── PageHeader ─────────────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg md:text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

/* ─── ConfirmModal ───────────────────────────────────────────────────────── */
export function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Delete', loading = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      actions={[
        <Button key="c" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>,
        <Button key="d" variant="danger"    onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting…' : confirmLabel}
        </Button>,
      ]}
    >
      <p className="text-sm text-slate-600">{message ?? 'This action cannot be undone.'}</p>
    </Modal>
  )
}
