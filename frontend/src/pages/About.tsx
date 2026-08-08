import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { useCategories } from '../hooks/useCatalog'
import { countryInfo } from '../lib/country'

function WorldPattern() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="about-dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#about-dots)" />
    </svg>
  )
}

export default function About() {
  const { data: countries, isLoading } = useCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="relative overflow-hidden pb-16 pt-20 text-center sm:pt-24">
        <WorldPattern />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(232,196,122,0.12), transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-gold-400">
            Our story
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl">
            The world&apos;s finest souvenirs,
            <br className="hidden sm:block" /> curated with care
          </h1>
        </div>
      </section>

      <section className="grid gap-12 pb-24 lg:grid-cols-5">
        <div className="space-y-6 text-base leading-relaxed text-mist lg:col-span-3">
          <p>
            Global Market began with a simple frustration: authentic souvenirs are everywhere if you
            are standing in the right market, and nowhere at all once you are home. We wanted a
            single place where the objects people actually carry home from their travels — the
            hand-thrown pot, the woven textile, the painted box — could find a permanent shelf.
          </p>
          <p>
            Today we work with small workshops and family ateliers across the world. Every item
            is chosen for what it tells you about its place: the craft, the colour, the hands that
            made it. No factory runs, no reproductions, nothing that could be bought in an airport.
          </p>
          <p>
            When you shop with us, you are not buying a product. You are bringing a little of a
            country home — and supporting the people who make it there.
          </p>
        </div>

        <div className="card space-y-6 p-6 sm:p-8 lg:col-span-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              The collection
            </p>
            <h2 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
              One market, country by country
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist sm:text-base">
              Every item carries its origin on its sleeve — and we keep adding new places as the
              collection grows.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
                ))
              : countries?.map((country) => (
                  <Link
                    key={country.id}
                    to={`/?country=${encodeURIComponent(country.name)}`}
                    className="group flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-cream transition-colors hover:border-white/10"
                  >
                    <span className="text-lg">{countryInfo(country.name).emoji}</span>
                    <span className="flex-1">{country.name}</span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: countryInfo(country.name).accent }}
                    />
                  </Link>
                ))}
          </div>
        </div>
      </section>

      <section className="mb-20 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
        <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold text-cream">
              Curious what a country feels like?
            </h2>
            <p className="mt-3 text-sm text-mist">
              Browse the collection country by country, or start with everything we have on the
              shelf right now.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/" className="btn-gold">
                Explore the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn">
                <MapPin className="h-4 w-4" /> Join the market
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5">
            {countries?.map((country) => {
              const info = countryInfo(country.name)
              return (
                <div
                  key={country.id}
                  title={country.name}
                  className="flex h-12 items-center justify-center rounded-lg border border-white/5 text-lg"
                  style={{ background: `linear-gradient(135deg, ${info.gradient[0]}33, ${info.gradient[1]}22)` }}
                >
                  {info.emoji}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
