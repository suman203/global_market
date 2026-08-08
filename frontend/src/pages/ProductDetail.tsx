import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react'
import { api } from '../api/endpoints'
import { useProduct, useProducts } from '../hooks/useCatalog'
import { useToast } from '../components/Toast'
import ProductCard from '../components/ProductCard'
import { countryInfo } from '../lib/country'
import { formatPrice } from '../lib/format'
import NotFound from './NotFound'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const productId = Number(id)
  const { data: product, isLoading, isError } = useProduct(productId)
  const country = countryInfo(product?.category?.name)

  const { data: related, isLoading: relatedLoading } = useProducts(
    product?.category ? { categoryId: product.category.id } : {},
  )
  const relatedItems = (related ?? []).filter((p) => p.id !== productId).slice(0, 4)

  const [quantity, setQuantity] = useState(1)
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const addToCart = useMutation({
    mutationFn: async (payload: { productId: number; quantity: number }) => {
      for (let i = 0; i < payload.quantity; i++) {
        await api.cart.add(payload.productId)
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="animate-pulse">
          <div className="h-4 w-40 rounded bg-white/5" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div className="aspect-[4/3] rounded-2xl bg-white/5" />
            <div className="space-y-4">
              <div className="h-5 w-24 rounded-full bg-white/5" />
              <div className="h-9 w-3/4 rounded bg-white/5" />
              <div className="h-7 w-28 rounded bg-white/5" />
              <div className="h-20 w-full rounded bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return <NotFound />
  }

  const handleAdd = () => {
    addToCart.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () =>
          toast(`${quantity > 1 ? `${quantity} × ` : ''}${product.name} added to cart`),
        onError: (error) => toast(error.message, 'error'),
      },
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-gold-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to collection
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="group aspect-[4/3] overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src = 'https://placehold.co/600x400/png?text=Global+Market'
            }}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col">
          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: country.accent }}
          >
            <span>{country.emoji}</span>
            {product.category?.name ?? 'World'}
          </span>

          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-cream sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-3 font-display text-2xl font-semibold text-gold-400">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 text-base leading-relaxed text-mist">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-ink-900 px-3 py-1.5">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/5 hover:text-cream"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium text-cream">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/5 hover:text-cream"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button onClick={handleAdd} disabled={addToCart.isPending} className="btn-gold flex-1 px-8 py-3 text-base sm:flex-none">
              <ShoppingBag className="h-4 w-4" />
              {addToCart.isPending ? 'Adding…' : `Add ${quantity > 1 ? `${quantity} to cart` : 'to cart'}`}
            </button>
          </div>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold text-cream">
            More from <span className="text-gold-400">{product.category?.name}</span>
          </h2>
          {relatedLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse overflow-hidden">
                  <div className="aspect-[3/2] bg-white/5" />
                  <div className="space-y-2 p-4">
                    <div className="h-5 w-3/4 rounded bg-white/5" />
                    <div className="h-3.5 w-1/2 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
