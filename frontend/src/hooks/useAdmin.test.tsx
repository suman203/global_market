import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Product, ProductPayload } from '../types/api'
import { useAllProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from './useAdmin'

const mocks = vi.hoisted(() => ({
  products: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

vi.mock('../api/endpoints', () => ({
  api: {
    catalog: { products: mocks.products },
    admin: { create: mocks.create, update: mocks.update, delete: mocks.remove },
  },
}))

const vase: Product = {
  id: 1,
  name: 'Souvenir Vase',
  description: 'Hand-painted vase',
  imageUrl: 'https://example.com/vase.png',
  price: 10,
  category: { id: 3, name: 'France' },
}

const payload: ProductPayload = {
  name: 'New Lantern',
  description: 'Brass lantern',
  imageUrl: 'https://example.com/lantern.png',
  price: 27.99,
  categoryId: 5,
}

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

beforeEach(() => {
  mocks.products.mockReset()
  mocks.create.mockReset()
  mocks.update.mockReset()
  mocks.remove.mockReset()
})

describe('useAllProducts', () => {
  it('fetches the product list', async () => {
    mocks.products.mockResolvedValue([vase])
    const client = makeClient()
    const { result } = renderHook(() => useAllProducts(), { wrapper: wrapper(client) })
    await waitFor(() => expect(result.current.data).toEqual([vase]))
  })
})

describe('useCreateProduct', () => {
  it('posts the payload and invalidates the product list', async () => {
    const created: Product = { ...vase, id: 2, name: payload.name }
    mocks.products.mockResolvedValueOnce([vase]).mockResolvedValue([vase, created])
    mocks.create.mockResolvedValue(created)
    const client = makeClient()

    const { result } = renderHook(() => ({ all: useAllProducts(), create: useCreateProduct() }), {
      wrapper: wrapper(client),
    })
    await waitFor(() => expect(result.current.all.data).toEqual([vase]))

    await act(async () => {
      result.current.create.mutate(payload)
    })

    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(payload))
    await waitFor(() => expect(result.current.create.isSuccess).toBe(true))
    await waitFor(() => expect(mocks.products).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.all.data?.some((p) => p.name === payload.name)).toBe(true))
  })
})

describe('useUpdateProduct', () => {
  it('posts the update to the given product id', async () => {
    mocks.update.mockResolvedValue({ ...vase, name: 'Renamed Vase' })
    const client = makeClient()
    const { result } = renderHook(() => useUpdateProduct(), { wrapper: wrapper(client) })

    await act(async () => {
      result.current.mutate({ id: vase.id, payload })
    })

    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith(1, payload))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteProduct', () => {
  it('deletes the product by id', async () => {
    mocks.remove.mockResolvedValue(undefined)
    const client = makeClient()
    const { result } = renderHook(() => useDeleteProduct(), { wrapper: wrapper(client) })

    await act(async () => {
      result.current.mutate(vase.id)
    })

    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith(1))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
