import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart, useAddToCart, useRemoveFromCart, useClearCart, useCheckout } from '../hooks/useCart'
import { useToast } from './Toast'
import { formatPrice } from '../lib/format'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { data: cart, isLoading } = useCart()
  const addToCart = useAddToCart()
  const removeFromCart = useRemoveFromCart()
  const clearCart = useClearCart()
  const checkout = useCheckout()
  const { toast } = useToast()

  const items = cart?.items ?? []
  const count = cart?.count ?? 0

  const handleCheckout = () => {
    checkout.mutate(undefined, {
      onSuccess: () => toast('Checkout complete — thank you!'),
      onError: (error) => toast(error.message, 'error'),
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ink-950/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-ink-900 shadow-soft"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gold-400" />
                <h2 className="font-display text-lg font-semibold text-cream">
                  Your cart{count > 0 ? ` (${count})` : ''}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/5 hover:text-cream"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex animate-pulse gap-3 rounded-xl bg-white/5 p-3">
                      <div className="h-20 w-20 rounded-lg bg-white/5" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 w-3/4 rounded bg-white/5" />
                        <div className="h-3 w-1/2 rounded bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                    <ShoppingBag className="h-8 w-8 text-mist" />
                  </div>
                  <p className="font-display text-lg text-cream">Your cart is empty</p>
                  <p className="max-w-52 text-sm text-mist">Discover souvenirs from around the world.</p>
                  <Link to="/" onClick={onClose} className="btn-gold mt-2">
                    Explore the collection
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.product.id} className="flex gap-3 rounded-xl border border-white/5 bg-ink-800 p-3">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={onClose}
                          className="truncate font-display text-sm font-semibold text-cream hover:text-gold-300"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-gold-400">{formatPrice(item.product.price)}</p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFromCart.mutate(item.product.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-mist transition-colors hover:text-cream"
                              aria-label={`Decrease quantity of ${item.product.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm text-cream">{item.quantity}</span>
                            <button
                              onClick={() => addToCart.mutate(item.product.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-mist transition-colors hover:text-cream"
                              aria-label={`Increase quantity of ${item.product.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              for (let i = 0; i < item.quantity; i++) removeFromCart.mutate(item.product.id)
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-mist transition-colors hover:text-danger"
                            aria-label={`Remove ${item.product.name} from cart`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-white/5 px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-mist">Total</span>
                  <span className="font-display text-xl font-semibold text-gold-400">
                    {formatPrice(cart?.totalPrice ?? 0)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => clearCart.mutate(undefined, { onError: (e) => toast(e.message, 'error') })}
                    className="btn-ghost flex-1"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={checkout.isPending}
                    className="btn-gold flex-1"
                  >
                    {checkout.isPending ? 'Checking out…' : 'Checkout'}
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
