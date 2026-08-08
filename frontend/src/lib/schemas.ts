import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(4, 'Username must be at least 4 characters')
      .max(32, 'Username must be at most 32 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(32, 'Password must be at most 32 characters'),
    passwordConfirm: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    city: z.string().optional(),
    gender: z.string().min(1, 'Select a gender'),
    age: z.coerce
      .number({ invalid_type_error: 'Enter your age' })
      .refine((value) => value > 13, 'You must be over 13'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })
export type RegisterValues = z.infer<typeof registerSchema>

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(32, 'Name must be at most 32 characters'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z
    .string()
    .url('Enter a valid image URL')
    .optional()
    .or(z.literal('')),
  price: z.coerce
    .number({ invalid_type_error: 'Enter a price' })
    .positive('Price must be positive'),
  categoryId: z.coerce.number({ invalid_type_error: 'Choose a category' }),
})
export type ProductFormValues = z.infer<typeof productSchema>

export const FALLBACK_IMAGE = 'https://placehold.co/600x400/png?text=Global+Market'
