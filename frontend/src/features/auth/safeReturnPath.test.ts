import { safeReturnPath } from './safeReturnPath'

describe('safeReturnPath', () => {
  it('keeps same-site paths', () => {
    expect(safeReturnPath('/profile/orders?page=2')).toBe('/profile/orders?page=2')
  })

  it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'profile', null])('rejects %s', (value) => {
    expect(safeReturnPath(value)).toBe('/profile')
  })
})
