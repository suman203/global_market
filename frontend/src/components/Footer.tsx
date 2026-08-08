import { Link } from 'react-router-dom'
import Brand from './Brand'
import { COUNTRIES } from '../lib/country'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-900/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Brand />
            <p className="mt-3 max-w-xs text-sm text-mist">
              Souvenirs from around the world — curated, artisanal, unforgettable.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-mist">Explore</p>
            <ul className="flex max-w-md flex-wrap gap-2">
              {COUNTRIES.map((country) => (
                <li key={country.name}>
                  <Link
                    to={`/?country=${encodeURIComponent(country.name)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-mist transition-colors hover:border-gold-400/50 hover:text-gold-300"
                  >
                    <span>{country.emoji}</span>
                    {country.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/5 pt-6 text-xs text-mist md:flex-row">
          <p>© 2026 Global Market. All rights reserved.</p>
          <p>Crafted with care for travelers.</p>
        </div>
      </div>
    </footer>
  )
}
