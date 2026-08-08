import { useQuery } from '@tanstack/react-query'
import { api } from '../api/endpoints'
import type { Category, Product, SortOption } from '../types/api'

export interface ProductQuery {
  categoryId?: number | null
  q?: string | null
  sort?: SortOption | null
}

export function useCategories() {
  return useQuery<Category[]>({ queryKey: ['categories'], queryFn: api.catalog.categories })
}

export function useProducts(params: ProductQuery = {}) {
  return useQuery<Product[]>({
    queryKey: ['products', params],
    queryFn: () => api.catalog.products(params),
    placeholderData: (previous) => previous,
  })
}

export function useProduct(id: number | undefined) {
  return useQuery<Product>({
    queryKey: ['products', { id }],
    queryFn: () => api.catalog.product(id as number),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}
