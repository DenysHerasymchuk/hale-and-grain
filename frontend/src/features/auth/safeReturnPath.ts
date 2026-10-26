/** Only same-site paths are allowed after login, so `?returnTo=` can't become an open redirect. */
export function safeReturnPath(value: string | null, fallback = '/profile'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  return value
}
