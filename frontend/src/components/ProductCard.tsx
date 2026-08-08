import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { Product } from '../types/api'
import { countryInfo } from '../lib/country'
import { formatPrice } from '../lib/format'
import { useAddToCart } from '../hooks/useCart'
import { useToast } from './Toast'

export default function ProductCard({ product }: { product: Product }) {
  const country = countryInfo(product.category?.name)
  const addToCart = useAddToCart()
  const { toast } = useToast()

  const handleAdd = () => {
    addToCart.mutate(
      { product },
      {
        onSuccess: () => toast(`${product.name} added to cart`),
        onError: (error) => toast(error.message, 'error'),
      },
    )
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4 }}
      className="card group overflow-hidden"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/2] overflow-hidden bg-ink-900">
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src = 'https://placehold.co/600x400/png?text=Global+Market'
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-soft"
            style={{ backgroundColor: country.accent }}
          >
            <span>{country.emoji}</span>
            {product.category?.name ?? 'World'}
          </span>
        </div>
      </Link>

      <div className="flex flex-col gap-1.5 p-4">
        <Link
          to={`/product/${product.id}`}
          className="font-display text-lg font-semibold leading-snug text-cream transition-colors hover:text-gold-300"
        >
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-mist">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-gold-400">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={addToCart.isPending}
            className="flex h-9 items-center gap-1.5 rounded-full border border-gold-400/40 px-4 text-sm font-medium text-gold-300 transition-all hover:bg-gold-400 hover:text-ink-950 active:scale-95 disabled:opacity-50"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </motion.article>
  )
}
