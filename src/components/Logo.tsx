import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  theme?: 'dark' | 'light'
  subtitle?: string
  className?: string
}

export const JEMonogram: React.FC<{ sizePx?: number; className?: string }> = ({
  sizePx = 40,
  className = '',
}) => {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
    >
      <defs>
        <linearGradient id="je-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="je-grad-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="je-grad-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer Squircle Badge with Ambient Shadow */}
      <rect x="6" y="6" width="108" height="108" rx="30" fill="url(#je-grad-bg)" />

      {/* Top Glass Sheen */}
      <path
        d="M 6 36 C 6 19.43 19.43 6 36 6 H 84 C 100.57 6 114 19.43 114 36 V 52 C 75 64 45 42 6 52 Z"
        fill="url(#je-grad-sheen)"
      />

      {/* Dynamic tracking beacon / ping above J */}
      <circle cx="43" cy="27" r="4.5" fill="#38BDF8" />
      <circle cx="43" cy="27" r="7.5" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.6" />

      {/* Monogram Glyph: "J" */}
      <path
        d="M 36 36 H 50 V 71 C 50 80.5 43.5 86 33 86 C 24 86 18.5 81 18.5 81 L 22.5 70 C 22.5 70 26 73.5 30.5 73.5 C 34.5 73.5 36 71 36 67 Z"
        fill="#FFFFFF"
      />

      {/* Monogram Glyph: "E" with Aerodynamic Speed Cuts */}
      {/* Top Arm */}
      <path
        d="M 59 36 H 92 C 94.5 36 96 38 95 40.5 L 93 45.5 C 92.5 47 91 48 89 48 H 59 V 36 Z"
        fill="#FFFFFF"
      />
      {/* Middle Arm with Cyan Speed Accent */}
      <path
        d="M 59 53 H 84 C 86 53 87 54.5 86.5 56.5 L 85 61.5 C 84.5 63 83 64 81 64 H 59 V 53 Z"
        fill="url(#je-grad-accent)"
      />
      {/* Bottom Arm */}
      <path
        d="M 59 69 H 93 C 95 69 96.5 70.5 96 72.5 L 94 78.5 C 93.5 80 91.5 81 89.5 81 H 59 V 69 Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

export default function Logo({
  size = 'md',
  showText = true,
  theme = 'dark',
  subtitle,
  className = '',
}: LogoProps) {
  const pixelMap = {
    sm: 32,
    md: 40,
    lg: 52,
    xl: 68,
  }

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  const isLight = theme === 'light' // light text on dark background

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <JEMonogram sizePx={pixelMap[size]} />
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${titleSizes[size]} ${
                isLight ? 'text-white' : 'text-slate-900'
              }`}
            >
              JE
            </span>
            <span className="text-xs uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-blue-600/10 text-blue-600">
              TRACK
            </span>
          </div>
          {subtitle && (
            <span
              className={`text-xs font-medium tracking-wide ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
