import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/endpoints'
import type { Cart, CartItem, Product } from '../types/api'

const CART_KEY = ['cart']

const EMPTY_CART: Cart = { items: [], totalPrice: 0, count: 0 }

function recalc(items: CartItem[]): Cart {
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  return { items, totalPrice, count }
}

function applyAdd(cart: Cart | undefined, product: Product, quantity = 1): Cart {
  const base = cart ?? EMPTY_CART
  const existing = base.items.find((item) => item.product.id === product.id)
  if (existing) {
    const items = base.items.map((item) =>
      item.product.id === product.id ? { product: item.product, quantity: item.quantity + quantity } : item,
    )
    return recalc(items)
  }
  return recalc([{ product, quantity }, ...base.items])
}

function applyRemove(cart: Cart | undefined, productId: number): Cart {
  const base = cart ?? EMPTY_CART
  if (!base.items.some((item) => item.product.id === productId)) return base
  const items = base.items
    .map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
    .filter((item) => item.quantity > 0)
  return recalc(items)
}

export function useCart() {
  return useQuery<Cart>({ queryKey: CART_KEY, queryFn: api.cart.get })
}

export interface AddToCartInput {
  product: Product
  quantity?: number
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation<Cart, Error, AddToCartInput, { previous?: Cart }>({
    mutationFn: ({ product, quantity = 1 }) => addQuantity(product.id, quantity),
    onMutate: async ({ product, quantity = 1 }) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY })
      const previous = queryClient.getQueryData<Cart>(CART_KEY)
      queryClient.setQueryData<Cart>(CART_KEY, (old) => applyAdd(old, product, quantity))
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(CART_KEY, context.previous)
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  return useMutation<Cart, Error, number, { previous?: Cart }>({
    mutationFn: (productId) => api.cart.remove(productId),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: CART_KEY })
      const previous = queryClient.getQueryData<Cart>(CART_KEY)
      queryClient.setQueryData<Cart>(CART_KEY, (old) => applyRemove(old, productId))
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(CART_KEY, context.previous)
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()
  return useMutation<Cart, Error, void, { previous?: Cart }>({
    mutationFn: () => api.cart.clear(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_KEY })
      const previous = queryClient.getQueryData<Cart>(CART_KEY)
      queryClient.setQueryData<Cart>(CART_KEY, EMPTY_CART)
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(CART_KEY, context.previous)
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useCheckout() {
  const queryClient = useQueryClient()
  return useMutation<Cart, Error, void, { previous?: Cart }>({
    mutationFn: () => api.cart.checkout(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_KEY })
      const previous = queryClient.getQueryData<Cart>(CART_KEY)
      queryClient.setQueryData<Cart>(CART_KEY, EMPTY_CART)
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(CART_KEY, context.previous)
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

async function addQuantity(productId: number, quantity: number): Promise<Cart> {
  let cart: Cart = { items: [], totalPrice: 0, count: 0 }
  for (let i = 0; i < quantity; i++) {
    cart = await api.cart.add(productId)
  }
  return cart
}
