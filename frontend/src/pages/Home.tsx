import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, SearchX } from 'lucide-react'
import { useCategories, useProducts } from '../hooks/useCatalog'
import ProductCard from '../components/ProductCard'
import { COUNTRIES, countryInfo } from '../lib/country'
import type { SortOption } from '../types/api'

function WorldPattern() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="aspect-[3/2] bg-white/5" />
      <div className="space-y-2 p-4">
        <div className="h-5 w-3/4 rounded bg-white/5" />
        <div className="h-3.5 w-full rounded bg-white/5" />
        <div className="h-3.5 w-2/3 rounded bg-white/5" />
      </div>
    </div>
  )
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const countryName = searchParams.get('country')
  const q = searchParams.get('q') ?? ''
  const sort = (searchParams.get('sort') ?? '') as SortOption

  const { data: categories } = useCategories()
  const categoryId = useMemo(() => {
    if (!countryName || !categories) return undefined
    return categories.find((c) => c.name === countryName)?.id
  }, [countryName, categories])

  const { data: products, isLoading, isError, error } = useProducts({ categoryId, q, sort })
  const activeCountry = countryInfo(countryName)

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }

  const selectCountry = (name: string) => {
    if (countryName === name) updateParams({ country: null })
    else updateParams({ country: name })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="relative overflow-hidden pb-16 pt-20 text-center sm:pt-28">
        <WorldPattern />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(232,196,122,0.12), transparent 70%), radial-gradient(ellipse 45% 40% at 15% 20%, rgba(46,95,163,0.18), transparent 70%), radial-gradient(ellipse 45% 40% at 85% 25%, rgba(46,137,90,0.14), transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-gold-400">
            Souvenirs from around the world
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-cream sm:text-6xl">
            The world&apos;s finest souvenirs,{' '}
            <span className="italic text-gold-400">curated</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-mist sm:text-lg">
            Handpicked keepsakes from ten countries — each with a story, each priced for the traveler.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="#collection" className="btn-gold px-7 py-3 text-base">
              Explore the collection
            </a>
            <Link to="/about" className="btn-ghost px-7 py-3 text-base">
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {COUNTRIES.map((country) => {
            const active = country.name === countryName
            return (
              <button
                key={country.name}
                onClick={() => selectCountry(country.name)}
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200"
                style={
                  active
                    ? { backgroundColor: country.accent, borderColor: country.accent, color: '#fff' }
                    : { borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }
                }
                aria-pressed={active}
              >
                <span>{country.emoji}</span>
                {country.name}
              </button>
            )
          })}
        </div>
      </section>

      <section id="collection" className="scroll-mt-24 pb-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-cream">
              {countryName ? (
                <span className="inline-flex items-center gap-2">
                  <span>{activeCountry.emoji}</span> {countryName} souvenirs
                </span>
              ) : q ? (
                <span>
                  Results for <span className="italic text-gold-400">“{q}”</span>
                </span>
              ) : (
                'The collection'
              )}
            </h2>
            <p className="mt-1 text-sm text-mist">
              {products?.length ?? 0} {products?.length === 1 ? 'piece' : 'pieces'}
              {(countryName || q) && (
                <button
                  onClick={() => updateParams({ country: null, q: null })}
                  className="ml-2 text-gold-400 underline-offset-2 hover:underline"
                >
                  clear filter
                </button>
              )}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-mist">
            Sort
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value || null })}
              className="input w-auto py-2"
            >
              <option value="">Featured</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>

        {isError ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <SearchX className="h-10 w-10 text-danger" />
            <p className="font-display text-lg text-cream">Couldn&apos;t load the collection</p>
            <p className="max-w-sm text-sm text-mist">{error?.message}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <SearchX className="h-10 w-10 text-mist" />
            <p className="font-display text-lg text-cream">No souvenirs found</p>
            <p className="max-w-sm text-sm text-mist">
              Try a different country, or clear the search to see the full collection.
            </p>
            <button onClick={() => updateParams({ country: null, q: null, sort: null })} className="btn-ghost mt-2">
              View all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="relative mb-24 overflow-hidden rounded-2xl border border-gold-400/20 bg-ink-900 p-10 text-center sm:p-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(232,196,122,0.14), transparent 70%)',
          }}
        />
        <div className="relative">
          <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">
            Bring the world home
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-mist">
            Join Global Market to build your collection and check out in seconds.
          </p>
          <Link to="/register" className="btn-gold mt-7 px-8 py-3 text-base">
            Create your account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
