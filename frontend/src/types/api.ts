export type Role = 'ADMIN' | 'USER'

export interface User {
  id: number
  username: string
  email: string
  firstName?: string | null
  lastName?: string | null
  age: number
  city?: string | null
  gender: string
  role: Role
}

export interface Category {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  price: number
  category: Category | null
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  totalPrice: number
  count: number
}

export interface ApiErrorBody {
  status?: number
  message?: string
  fieldErrors?: Record<string, string>
}

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  passwordConfirm: string
  firstName?: string
  lastName?: string
  city?: string
  gender: string
  age: number
}

export interface ProductPayload {
  name: string
  description: string
  imageUrl: string
  price: number
  categoryId: number
}

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | ''
