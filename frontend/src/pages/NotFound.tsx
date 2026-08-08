import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
        <Compass className="h-10 w-10 text-gold-400" />
      </div>
      <p className="mt-6 font-display text-6xl font-semibold text-gold-400">404</p>
      <h1 className="mt-2 font-display text-2xl text-cream">You&apos;ve wandered off the map</h1>
      <p className="mt-2 max-w-md text-sm text-mist">
        The page you&apos;re looking for doesn&apos;t exist — but the world of souvenirs is still here.
      </p>
      <Link to="/" className="btn-gold mt-7">
        Back to the collection
      </Link>
    </div>
  )
}
