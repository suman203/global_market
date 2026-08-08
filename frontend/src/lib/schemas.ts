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
