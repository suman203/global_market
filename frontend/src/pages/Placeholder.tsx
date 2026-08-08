import { Link } from 'react-router-dom'
import { Hammer } from 'lucide-react'

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <Hammer className="h-8 w-8 text-gold-400" />
      </div>
      <h1 className="mt-5 font-display text-2xl text-cream">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-mist">
        This page is under construction — it&apos;s coming in a later build phase.
      </p>
      <Link to="/" className="btn-ghost mt-6">
        Back to the collection
      </Link>
    </div>
  )
}
