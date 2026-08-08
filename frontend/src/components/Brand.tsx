import { Link } from 'react-router-dom'

export function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" className="fill-ink-900" />
      <circle cx="32" cy="30" r="18" fill="none" className="stroke-gold-500" strokeWidth="3" />
      <ellipse cx="32" cy="30" rx="8" ry="18" fill="none" className="stroke-gold-500" strokeWidth="2.5" />
      <line x1="14" y1="30" x2="50" y2="30" className="stroke-gold-500" strokeWidth="2.5" />
      <path d="M32 48l-4 7h8z" className="fill-gold-400" />
      <circle cx="32" cy="30" r="3" className="fill-gold-400" />
    </svg>
  )
}

export default function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <BrandMark />
      <span className="font-display text-xl font-semibold tracking-wide text-cream">
        Global<span className="text-gold-400">Market</span>
      </span>
    </Link>
  )
}
