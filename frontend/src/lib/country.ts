export interface CountryInfo {
  name: string
  emoji: string
  accent: string
  gradient: [string, string]
}

export const COUNTRIES: CountryInfo[] = [
  { name: 'France', emoji: '🇫🇷', accent: '#2E5FA3', gradient: ['#2E5FA3', '#C9A961'] },
  { name: 'Japan', emoji: '🇯🇵', accent: '#C0392B', gradient: ['#C0392B', '#F7F3EC'] },
  { name: 'Italy', emoji: '🇮🇹', accent: '#1E8449', gradient: ['#1E8449', '#E8C47A'] },
  { name: 'India', emoji: '🇮🇳', accent: '#E67E22', gradient: ['#E67E22', '#2E86C1'] },
  { name: 'Mexico', emoji: '🇲🇽', accent: '#27AE60', gradient: ['#27AE60', '#E74C3C'] },
  { name: 'Morocco', emoji: '🇲🇦', accent: '#A0522D', gradient: ['#A0522D', '#1ABC9C'] },
  { name: 'Vietnam', emoji: '🇻🇳', accent: '#D32F2F', gradient: ['#D32F2F', '#F1C40F'] },
  { name: 'Turkey', emoji: '🇹🇷', accent: '#C0392B', gradient: ['#C0392B', '#16A085'] },
  { name: 'Brazil', emoji: '🇧🇷', accent: '#1E8449', gradient: ['#1E8449', '#F1C40F'] },
  { name: 'Spain', emoji: '🇪🇸', accent: '#D32F2F', gradient: ['#D32F2F', '#F1C40F'] },
]

const FALLBACK: CountryInfo = { name: 'World', emoji: '🌍', accent: '#C9A961', gradient: ['#C9A961', '#E8C47A'] }

export function countryInfo(name?: string | null): CountryInfo {
  if (!name) return FALLBACK
  return COUNTRIES.find((c) => c.name === name) ?? FALLBACK
}
