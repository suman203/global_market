import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/endpoints'
import type { Product, ProductPayload } from '../types/api'

export function useAllProducts() {
  return useQuery<Product[]>({
    queryKey: ['products', 'admin'],
    queryFn: () => api.catalog.products({}),
  })
}

function invalidateProducts(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['products'] })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation<Product, Error, ProductPayload>({
    mutationFn: (payload) => api.admin.create(payload),
    onSuccess: () => invalidateProducts(queryClient),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation<Product, Error, { id: number; payload: ProductPayload }>({
    mutationFn: ({ id, payload }) => api.admin.update(id, payload),
    onSuccess: () => invalidateProducts(queryClient),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.admin.delete(id),
    onSuccess: () => invalidateProducts(queryClient),
  })
}
