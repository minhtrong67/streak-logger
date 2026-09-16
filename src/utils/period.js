// Maps each time-of-day bucket to a consistent Badge tone and chart hex,
// so period colors never drift out of sync between the table, the detail
// modal, and the statistics charts. Chosen to evoke the actual time of day:
// morning = warm sunrise amber, noon = bright sky, afternoon = teal (brand
// secondary), evening = dusk violet.
export const PERIOD_TONE = {
  morning: 'warning',
  noon: 'info',
  afternoon: 'teal',
  evening: 'purple',
}

export const PERIOD_HEX = {
  morning: '#D97706',
  noon: '#0284C7',
  afternoon: '#1B6E6A',
  evening: '#7C3AED',
}

export const PERIOD_HEX_DARK = {
  morning: '#F59E0B',
  noon: '#38BDF8',
  afternoon: '#4FBDB6',
  evening: '#B794F6',
}
