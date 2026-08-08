import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema, productSchema } from './schemas'

describe('loginSchema', () => {
  it('accepts a valid username and password', () => {
    const result = loginSchema.safeParse({ username: 'admin', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('rejects a missing username', () => {
    const result = loginSchema.safeParse({ username: '', password: 'secret' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].path[0]).toBe('username')
  })

  it('rejects a missing password', () => {
    const result = loginSchema.safeParse({ username: 'admin', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].path[0]).toBe('password')
  })
})

const validRegister = {
  username: 'traveller',
  email: 'traveller@example.com',
  password: 'longenough',
  passwordConfirm: 'longenough',
  gender: 'Female',
  age: 28,
}

describe('registerSchema (mirrors UserValidator)', () => {
  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true)
  })

  it('rejects a username shorter than 4 characters', () => {
    const result = registerSchema.safeParse({ ...validRegister, username: 'abc' })
    expect(result.success).toBe(false)
  })

  it('rejects a username longer than 32 characters', () => {
    const result = registerSchema.safeParse({ ...validRegister, username: 'a'.repeat(33) })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email format', () => {
    const result = registerSchema.safeParse({ ...validRegister, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...validRegister, password: 'short', passwordConfirm: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects a password longer than 32 characters', () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: 'a'.repeat(33),
      passwordConfirm: 'a'.repeat(33),
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched password confirmations', () => {
    const result = registerSchema.safeParse({ ...validRegister, passwordConfirm: 'different' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].path[0]).toBe('passwordConfirm')
  })

  it('rejects an age of 13 or younger', () => {
    expect(registerSchema.safeParse({ ...validRegister, age: 13 }).success).toBe(false)
    expect(registerSchema.safeParse({ ...validRegister, age: 12 }).success).toBe(false)
  })

  it('accepts a missing optional name and city', () => {
    const result = registerSchema.safeParse({
      username: 'traveller',
      email: 'traveller@example.com',
      password: 'longenough',
      passwordConfirm: 'longenough',
      gender: 'Female',
      age: 28,
    })
    expect(result.success).toBe(true)
  })
})

const validProduct = {
  name: 'Souvenir Pot',
  description: 'Hand-thrown ceramic pot',
  imageUrl: 'https://placehold.co/600x400/png?text=Pot',
  price: 24.99,
  categoryId: 3,
}

describe('productSchema (mirrors ProductValidator)', () => {
  it('accepts a valid product', () => {
    expect(productSchema.safeParse(validProduct).success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = productSchema.safeParse({ ...validProduct, name: 'x' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].path[0]).toBe('name')
  })

  it('rejects a name longer than 32 characters', () => {
    const result = productSchema.safeParse({ ...validProduct, name: 'a'.repeat(33) })
    expect(result.success).toBe(false)
  })

  it('rejects a missing description', () => {
    const result = productSchema.safeParse({ ...validProduct, description: '' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].path[0]).toBe('description')
  })

  it('rejects an invalid image URL but allows an empty one', () => {
    expect(productSchema.safeParse({ ...validProduct, imageUrl: 'not-a-url' }).success).toBe(false)
    expect(productSchema.safeParse({ ...validProduct, imageUrl: '' }).success).toBe(true)
  })

  it('rejects a zero or negative price', () => {
    expect(productSchema.safeParse({ ...validProduct, price: 0 }).success).toBe(false)
    expect(productSchema.safeParse({ ...validProduct, price: -5 }).success).toBe(false)
  })

  it('rejects a missing category', () => {
    const result = productSchema.safeParse({ ...validProduct, categoryId: undefined })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].path[0]).toBe('categoryId')
  })
})
