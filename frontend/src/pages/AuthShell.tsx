import type { ReactNode } from 'react'
import { BrandMark } from '../components/Brand'

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="relative hidden overflow-hidden rounded-3xl border border-white/5 bg-ink-900 p-10 lg:block">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="auth-dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-dots)" />
        </svg>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 30% 10%, rgba(232,196,122,0.16), transparent 70%), radial-gradient(ellipse 60% 50% at 90% 90%, rgba(46,95,163,0.18), transparent 70%)',
          }}
        />
        <div className="relative">
          <BrandMark className="h-14 w-14" />
          <h1 className="mt-8 font-display text-4xl font-semibold leading-tight text-cream">
            The world&apos;s finest souvenirs, <span className="italic text-gold-400">curated</span>.
          </h1>
          <p className="mt-4 max-w-sm text-mist">
            Handpicked keepsakes from around the world. Join the atelier to build your collection.
          </p>
        </div>
      </div>

      <div className="w-full max-w-md justify-self-center lg:justify-self-start">
        <div className="card p-8">
          <h2 className="font-display text-2xl font-semibold text-cream">{title}</h2>
          <p className="mt-1 text-sm text-mist">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        {footer && <p className="mt-5 text-center text-sm text-mist">{footer}</p>}
      </div>
    </div>
  )
}
