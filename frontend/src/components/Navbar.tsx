import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Search, ShoppingBag, UserRound, ShieldCheck } from 'lucide-react'
import Brand from './Brand'
import { useAuth } from '../auth/AuthProvider'
import { useCart } from '../hooks/useCart'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative text-sm font-medium transition-colors hover:text-gold-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-gold-400 after:transition-all after:duration-300 ${
    isActive ? 'text-gold-300 after:w-full' : 'text-mist after:w-0 hover:after:w-full'
  }`

export default function Navbar({ onOpenCart }: { onOpenCart: () => void }) {
  const { user, isLoading, logout } = useAuth()
  const { data: cart } = useCart()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const count = cart?.count ?? 0

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const term = query.trim()
    navigate(term ? `/?q=${encodeURIComponent(term)}` : '/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Brand />

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        <form onSubmit={handleSearch} className="relative ml-auto hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search souvenirs…"
            className="input pl-9"
            aria-label="Search souvenirs"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <button
            onClick={onOpenCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/5 hover:text-gold-300"
            aria-label={`Open cart (${count} items)`}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[11px] font-semibold text-ink-950">
                {count}
              </span>
            )}
          </button>

          {isLoading ? (
            <span className="hidden h-9 w-24 animate-pulse rounded-full bg-white/5 sm:block" />
          ) : user ? (
            <div className="hidden items-center gap-1 sm:flex">
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gold-300 transition-colors hover:bg-white/5"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="max-w-24 truncate">{user.username}</span>
                </Link>
              )}
              {user.role === 'USER' && (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-cream transition-colors hover:bg-white/5"
                  title="Your profile"
                >
                  <UserRound className="h-5 w-5 text-gold-400" />
                  <span className="max-w-24 truncate font-medium">{user.username}</span>
                </Link>
              )}
              <button
                onClick={() => void logout()}
                className="flex h-10 w-10 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/5 hover:text-danger"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-gold">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
