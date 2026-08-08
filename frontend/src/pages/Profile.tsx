import { Link } from 'react-router-dom'
import { Mail, MapPin, Pencil } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { countryInfo } from '../lib/country'

export default function Profile() {
  const { user } = useAuth()
  if (!user) return null

  const initial = user.username.charAt(0).toUpperCase()
  const country = countryInfo(user.city)

  const details: { label: string; value?: string | null }[] = [
    { label: 'First name', value: user.firstName || '—' },
    { label: 'Last name', value: user.lastName || '—' },
    { label: 'Age', value: user.age ? String(user.age) : '—' },
    { label: 'City', value: user.city || '—' },
    { label: 'Gender', value: user.gender || '—' },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="card overflow-hidden">
        <div className="relative h-28 bg-gradient-to-r from-ink-800 via-ink-700 to-ink-800">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(ellipse 60% 80% at 70% 20%, rgba(232,196,122,0.35), transparent 70%)',
            }}
          />
        </div>

        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-gold-400/30 bg-ink-900 font-display text-3xl font-semibold text-gold-400 shadow-soft">
                {initial}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl font-semibold text-cream">{user.username}</h1>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      user.role === 'ADMIN' ? 'bg-gold-400 text-ink-950' : 'bg-white/10 text-cream'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-mist">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </p>
                {user.city && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-mist">
                    <MapPin className="h-3.5 w-3.5" /> {country.emoji} {user.city}
                  </p>
                )}
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-mist">
              <Pencil className="h-3.5 w-3.5" /> Profile is read-only in v1
            </span>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {details.map((detail) => (
              <div key={detail.label} className="rounded-xl border border-white/5 bg-ink-950/40 px-4 py-3">
                <dt className="text-xs uppercase tracking-widest text-mist">{detail.label}</dt>
                <dd className="mt-1 text-sm font-medium text-cream">{detail.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 border-t border-white/5 pt-6">
            <Link to="/" className="btn-ghost">
              Back to the collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
