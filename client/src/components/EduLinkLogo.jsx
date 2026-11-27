/**
 * EduLink Logo
 *
 * Concept: Two interlocking hexagonal nodes (representing a network/link)
 * with a graduating mortarboard cap fused into the top node.
 * The chain/link metaphor communicates "connected education".
 * Colors follow the brand indigo palette exactly.
 */
export default function EduLinkLogo({ size = 40, variant = 'full' }) {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="logoGrad2" x1="48" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>

      {/* Bottom-right node — hexagon */}
      <path
        d="M28 26 L34 22.5 L34 29.5 L28 33 L22 29.5 L22 22.5 Z"
        fill="url(#logoGrad2)"
        opacity="0.9"
      />

      {/* Connecting bridge between nodes */}
      <rect x="20" y="17" width="8" height="3" rx="1.5" fill="#a5b4fc" opacity="0.7" />

      {/* Top-left node — hexagon (larger, primary) */}
      <path
        d="M20 7 L27 10.5 L27 18.5 L20 22 L13 18.5 L13 10.5 Z"
        fill="url(#logoGrad)"
      />

      {/* Mortarboard cap ON the top node */}
      {/* Cap board */}
      <path
        d="M14 11.5 L20 8.5 L26 11.5 L20 14.5 Z"
        fill="white"
        opacity="0.95"
      />
      {/* Cap top square */}
      <rect x="18" y="8" width="4" height="1" rx="0.5" fill="white" opacity="0.6" />
      {/* Tassel drop */}
      <line x1="26" y1="11.5" x2="26.5" y2="15" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
      <circle cx="26.5" cy="15.5" r="0.8" fill="white" opacity="0.8" />

      {/* Dot accent bottom node center */}
      <circle cx="28" cy="27.75" r="1.5" fill="white" opacity="0.6" />
    </svg>
  )

  if (variant === 'icon') return mark

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {mark}
      <span style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 800,
        fontSize: size * 0.5,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Edu<span style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>Link</span>
      </span>
    </div>
  )
}

/** White variant for dark backgrounds */
export function EduLinkLogoWhite({ size = 40, variant = 'full' }) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 26 L34 22.5 L34 29.5 L28 33 L22 29.5 L22 22.5 Z" fill="white" opacity="0.5" />
      <rect x="20" y="17" width="8" height="3" rx="1.5" fill="white" opacity="0.4" />
      <path d="M20 7 L27 10.5 L27 18.5 L20 22 L13 18.5 L13 10.5 Z" fill="white" opacity="0.9" />
      <path d="M14 11.5 L20 8.5 L26 11.5 L20 14.5 Z" fill="#4f46e5" opacity="0.9" />
      <rect x="18" y="8" width="4" height="1" rx="0.5" fill="#4f46e5" opacity="0.7" />
      <line x1="26" y1="11.5" x2="26.5" y2="15" stroke="#4f46e5" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="26.5" cy="15.5" r="0.8" fill="#4f46e5" />
      <circle cx="28" cy="27.75" r="1.5" fill="#4f46e5" opacity="0.6" />
    </svg>
  )

  if (variant === 'icon') return mark

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {mark}
      <span style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 800,
        fontSize: size * 0.5,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color: 'white',
      }}>
        Edu<span style={{ color: '#a5b4fc' }}>Link</span>
      </span>
    </div>
  )
}
