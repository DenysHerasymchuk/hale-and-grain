import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { Toggle } from '@/components/base/toggle/toggle'
import { accountApi } from '@/features/account/api'
import { useProfile, useUpdateProfile } from '@/features/account/hooks'
import { authApi } from '@/features/auth/api'
import { useLogout } from '@/features/auth/useSession'
import { ApiError } from '@/lib/apiClient'
import { routePaths } from '@/Routes/routePaths'

export function ProfileSettingsPage() {
  return (
    <div className="max-w-lg space-y-14">
      <h1 className="font-display text-3xl text-primary">Settings</h1>
      <EmailPreferences />
      <ChangePassword />
      <DeleteAccount />
    </div>
  )
}

function EmailPreferences() {
  const { data: profile } = useProfile()
  const update = useUpdateProfile()

  if (!profile) return null

  return (
    <section aria-labelledby="preferences-heading">
      <h2 id="preferences-heading" className="font-display text-xl text-primary">
        Email preferences
      </h2>
      <Toggle
        className="mt-4"
        label="Studio news and new collections"
        hint="A few emails a year. Order updates are always sent."
        isSelected={profile.marketingEmails}
        isDisabled={update.isPending}
        onChange={(marketingEmails) => update.mutate({ firstName: profile.firstName, lastName: profile.lastName, marketingEmails })}
      />
    </section>
  )
}

function ChangePassword() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const change = useMutation({
    mutationFn: () => authApi.changePassword(current, next),
    onSuccess: () => {
      setCurrent('')
      setNext('')
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    change.mutate()
  }

  return (
    <section aria-labelledby="password-heading">
      <h2 id="password-heading" className="font-display text-xl text-primary">
        Password
      </h2>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <Input label="Current password" type="password" autoComplete="current-password" isRequired value={current} onChange={setCurrent} />
        <Input label="New password" type="password" autoComplete="new-password" isRequired value={next} onChange={setNext} hint="At least 10 characters, with upper- and lower-case letters and a number." />
        <div aria-live="polite" className="text-sm">
          {change.isSuccess && <p className="text-success-primary">Password updated.</p>}
          {change.error && <p className="text-error-primary">{change.error instanceof ApiError ? change.error.messages.join(' ') : 'Could not update password.'}</p>}
        </div>
        <Button type="submit" size="md" isLoading={change.isPending}>
          Update password
        </Button>
      </form>
    </section>
  )
}

function DeleteAccount() {
  const navigate = useNavigate()
  const logout = useLogout()
  const [password, setPassword] = useState('')
  const remove = useMutation({
    mutationFn: () => accountApi.deleteAccount(password),
    onSuccess: () => logout.mutate(undefined, { onSettled: () => void navigate(routePaths.home) }),
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    remove.mutate()
  }

  return (
    <section aria-labelledby="delete-heading" className="rounded-[var(--radius-card)] border border-error-subtle p-6">
      <h2 id="delete-heading" className="font-display text-xl text-primary">
        Delete account
      </h2>
      <p className="mt-2 text-sm text-tertiary">
        Removes your profile, addresses and wishlist. Past orders are kept for our accounts but no longer linked to you. This can&rsquo;t be undone.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-4">
        <Input label="Confirm with your password" type="password" autoComplete="current-password" isRequired value={password} onChange={setPassword} />
        {remove.error && (
          <p role="alert" className="text-sm text-error-primary">
            {remove.error instanceof ApiError ? remove.error.messages.join(' ') : 'Could not delete the account.'}
          </p>
        )}
        <Button type="submit" size="md" color="primary-destructive" isLoading={remove.isPending}>
          Delete my account
        </Button>
      </form>
    </section>
  )
}
