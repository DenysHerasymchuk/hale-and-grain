const formatters = new Map<string, Intl.NumberFormat>()

export function formatMoney(amount: number, currency = 'EUR'): string {
  let formatter = formatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-IE', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 })
    formatters.set(currency, formatter)
  }
  return formatter.format(amount)
}
