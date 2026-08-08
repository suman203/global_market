import { describe, expect, it } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('formats whole dollars with two decimals', () => {
    expect(formatPrice(24.99)).toBe('$24.99')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('formats thousands with grouping separators', () => {
    expect(formatPrice(1234.5)).toBe('$1,234.50')
  })

  it('rounds to two decimal places', () => {
    expect(formatPrice(19.999)).toBe('$20.00')
  })
})
