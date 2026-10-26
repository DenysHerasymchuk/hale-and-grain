const formatters = new Map<string, Intl.NumberFormat>()

/** Display-only formatting. Totals that matter are always calculated by the API. */
export function formatMoney(amount: number, currency = 'EUR'): string {
  let formatter = formatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-IE', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 })
    formatters.set(currency, formatter)
  }
  return formatter.format(amount)
}
