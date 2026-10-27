export const shippingCountries = [
  { value: 'AT', label: 'Austria' },
  { value: 'BE', label: 'Belgium' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IT', label: 'Italy' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'PT', label: 'Portugal' },
  { value: 'ES', label: 'Spain' },
]

export const countryName = (code: string) => shippingCountries.find((c) => c.value === code)?.label ?? code
