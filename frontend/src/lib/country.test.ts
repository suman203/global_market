import { describe, expect, it } from 'vitest'
import { COUNTRIES, countryInfo } from './country'

describe('countryInfo', () => {
  it('returns the accent and emoji for a known country', () => {
    const france = countryInfo('France')
    expect(france.emoji).toBe('🇫🇷')
    expect(france.accent).toBe('#2E5FA3')
    expect(france.gradient).toEqual(['#2E5FA3', '#C9A961'])
  })

  it('maps every entry in the accent map', () => {
    for (const country of COUNTRIES) {
      const info = countryInfo(country.name)
      expect(info.name).toBe(country.name)
      expect(info.accent).toBe(country.accent)
    }
  })

  it('falls back to the World accent for an unknown country', () => {
    const info = countryInfo('Atlantis')
    expect(info.emoji).toBe('🌍')
    expect(info.accent).toBe('#C9A961')
  })

  it('falls back for null or undefined', () => {
    expect(countryInfo(null).name).toBe('World')
    expect(countryInfo(undefined).name).toBe('World')
  })
})
