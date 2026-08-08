import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/endpoints'
import type { Cart } from '../types/api'

const CART_KEY = ['cart']

export function useCart() {
  return useQuery<Cart>({ queryKey: CART_KEY, queryFn: api.cart.get })
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation<Cart, Error, number>({
    mutationFn: (productId) => api.cart.add(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  return useMutation<Cart, Error, number>({
    mutationFn: (productId) => api.cart.remove(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()
  return useMutation<Cart, Error, void>({
    mutationFn: () => api.cart.clear(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}

export function useCheckout() {
  const queryClient = useQueryClient()
  return useMutation<Cart, Error, void>({
    mutationFn: () => api.cart.checkout(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  })
}
