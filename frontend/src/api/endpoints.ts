import { del, get, post, put, queryString } from './client'
import type {
  Cart,
  Category,
  LoginPayload,
  Product,
  ProductPayload,
  RegisterPayload,
  SortOption,
  User,
} from '../types/api'

export const api = {
  auth: {
    me: () => get<User | null>('/api/auth/me'),
    login: (payload: LoginPayload) => post<User>('/api/auth/login', payload),
    logout: () => post<void>('/api/auth/logout'),
    register: (payload: RegisterPayload) => post<User>('/api/auth/register', payload),
  },
  catalog: {
    products: (params: { categoryId?: number | null; q?: string | null; sort?: SortOption | null } = {}) =>
      get<Product[]>(`/api/products${queryString(params)}`),
    product: (id: number) => get<Product>(`/api/products/${id}`),
    categories: () => get<Category[]>('/api/categories'),
  },
  cart: {
    get: () => get<Cart>('/api/cart'),
    add: (productId: number) => post<Cart>(`/api/cart/items/${productId}`),
    remove: (productId: number) => del<Cart>(`/api/cart/items/${productId}`),
    clear: () => post<Cart>('/api/cart/clear'),
    checkout: () => post<Cart>('/api/cart/checkout'),
  },
  admin: {
    create: (payload: ProductPayload) => post<Product>('/api/admin/products', payload),
    update: (id: number, payload: ProductPayload) => put<Product>(`/api/admin/products/${id}`, payload),
    delete: (id: number) => del<void>(`/api/admin/products/${id}`),
  },
  user: {
    me: () => get<User>('/api/user/me'),
  },
}
