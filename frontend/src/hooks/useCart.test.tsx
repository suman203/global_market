import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Cart, Product } from '../types/api'
import { useAddToCart, useCart, useClearCart, useRemoveFromCart } from './useCart'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
  checkout: vi.fn(),
}))

vi.mock('../api/endpoints', () => ({
  api: { cart: mocks },
}))

const product: Product = {
  id: 1,
  name: 'Souvenir Vase',
  description: 'Hand-painted vase',
  imageUrl: 'https://example.com/vase.png',
  price: 10,
  category: null,
}

const emptyCart: Cart = { items: [], totalPrice: 0, count: 0 }

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

beforeEach(() => {
  mocks.get.mockReset()
  mocks.add.mockReset()
  mocks.remove.mockReset()
  mocks.clear.mockReset()
})

describe('useCart', () => {
  it('returns the server cart', async () => {
    mocks.get.mockResolvedValue({ items: [{ product, quantity: 1 }], totalPrice: 10, count: 1 })
    const client = makeClient()
    const { result } = renderHook(() => useCart(), { wrapper: wrapper(client) })
    await waitFor(() => expect(result.current.data?.count).toBe(1))
  })
})

describe('useAddToCart', () => {
  it('optimistically adds a product before the server responds', async () => {
    mocks.add.mockReturnValue(new Promise(() => {}))
    const client = makeClient()
    client.setQueryData(['cart'], emptyCart)

    const { result } = renderHook(() => useAddToCart(), { wrapper: wrapper(client) })
    await act(async () => {
      result.current.mutate({ product })
    })

    const updated = client.getQueryData<Cart>(['cart'])
    expect(updated?.count).toBe(1)
    expect(updated?.items[0]).toEqual({ product, quantity: 1 })
    expect(updated?.totalPrice).toBe(10)
  })

  it('merges quantity when the product is already in the cart', async () => {
    mocks.add.mockReturnValue(new Promise(() => {}))
    const client = makeClient()
    client.setQueryData<Cart>(['cart'], { items: [{ product, quantity: 1 }], totalPrice: 10, count: 1 })

    const { result } = renderHook(() => useAddToCart(), { wrapper: wrapper(client) })
    await act(async () => {
      result.current.mutate({ product, quantity: 2 })
    })

    const updated = client.getQueryData<Cart>(['cart'])
    expect(updated?.count).toBe(3)
    expect(updated?.items[0].quantity).toBe(3)
  })

  it('rolls back to the previous cart when the add fails', async () => {
    mocks.add.mockRejectedValue(new Error('network down'))
    const client = makeClient()
    const previous: Cart = { items: [{ product, quantity: 1 }], totalPrice: 10, count: 1 }
    client.setQueryData(['cart'], previous)

    const { result } = renderHook(() => useAddToCart(), { wrapper: wrapper(client) })
    await act(async () => {
      result.current.mutate({ product })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryData<Cart>(['cart'])).toEqual(previous)
  })
})

describe('useRemoveFromCart', () => {
  it('decrements quantity optimistically', async () => {
    mocks.remove.mockReturnValue(new Promise(() => {}))
    const client = makeClient()
    client.setQueryData<Cart>(['cart'], { items: [{ product, quantity: 2 }], totalPrice: 20, count: 2 })

    const { result } = renderHook(() => useRemoveFromCart(), { wrapper: wrapper(client) })
    await act(async () => {
      result.current.mutate(product.id)
    })

    const updated = client.getQueryData<Cart>(['cart'])
    expect(updated?.count).toBe(1)
    expect(updated?.items[0].quantity).toBe(1)
  })

  it('removes the line item when quantity reaches zero', async () => {
    mocks.remove.mockReturnValue(new Promise(() => {}))
    const client = makeClient()
    client.setQueryData<Cart>(['cart'], { items: [{ product, quantity: 1 }], totalPrice: 10, count: 1 })

    const { result } = renderHook(() => useRemoveFromCart(), { wrapper: wrapper(client) })
    await act(async () => {
      result.current.mutate(product.id)
    })

    const updated = client.getQueryData<Cart>(['cart'])
    expect(updated?.count).toBe(0)
    expect(updated?.items).toHaveLength(0)
  })
})

describe('useClearCart', () => {
  it('empties the cart optimistically and rolls back on error', async () => {
    mocks.clear.mockRejectedValue(new Error('server down'))
    const client = makeClient()
    const previous: Cart = { items: [{ product, quantity: 2 }], totalPrice: 20, count: 2 }
    client.setQueryData(['cart'], previous)

    const { result } = renderHook(() => useClearCart(), { wrapper: wrapper(client) })
    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryData<Cart>(['cart'])).toEqual(previous)
  })
})
