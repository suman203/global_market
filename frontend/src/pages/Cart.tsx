import { Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useCart, useClearCart, useCheckout } from '../hooks/useCart'
import { CartItemRow } from '../components/CartDrawer'
import { useToast } from '../components/Toast'
import { formatPrice } from '../lib/format'

export default function Cart() {
  const { data: cart, isLoading } = useCart()
  const clearCart = useClearCart()
  const checkout = useCheckout()
  const { toast } = useToast()

  const items = cart?.items ?? []

  const handleCheckout = () => {
    checkout.mutate(undefined, {
      onSuccess: () => toast('Checkout complete — thank you!'),
      onError: (error) => toast(error.message, 'error'),
    })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex animate-pulse gap-3 rounded-xl border border-white/5 bg-ink-800 p-3">
                <div className="h-20 w-20 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                  <div className="h-3 w-1/2 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-44 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-gold-300"
      >
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>

      <h1 className="mt-4 font-display text-3xl font-semibold text-cream">
        Your cart{cart && cart.count > 0 ? ` (${cart.count})` : ''}
      </h1>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-ink-900 p-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
            <ShoppingBag className="h-8 w-8 text-mist" />
          </div>
          <p className="font-display text-xl text-cream">Your cart is empty</p>
          <p className="max-w-sm text-sm text-mist">
            Fill it with souvenirs from around the world — the collection awaits.
          </p>
          <Link to="/" className="btn-gold mt-2">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <ul className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}
          </ul>

          <aside className="h-fit rounded-2xl border border-white/5 bg-ink-900 p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold text-cream">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-mist">
                <dt>Items</dt>
                <dd className="text-cream">{cart?.count}</dd>
              </div>
              <div className="flex justify-between text-mist">
                <dt>Shipping</dt>
                <dd className="text-gold-400">Free</dd>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-3">
                <dt className="font-medium text-cream">Total</dt>
                <dd className="font-display text-xl font-semibold text-gold-400">
                  {formatPrice(cart?.totalPrice ?? 0)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handleCheckout}
                disabled={checkout.isPending}
                className="btn-gold w-full py-3"
              >
                {checkout.isPending ? 'Checking out…' : 'Checkout'}
              </button>
              <button
                onClick={() =>
                  clearCart.mutate(undefined, {
                    onSuccess: () => toast('Cart cleared'),
                    onError: (error) => toast(error.message, 'error'),
                  })
                }
                className="btn-ghost w-full"
              >
                Clear cart
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
