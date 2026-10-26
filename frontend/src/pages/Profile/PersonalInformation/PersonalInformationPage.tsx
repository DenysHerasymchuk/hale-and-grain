import { useState, type FormEvent } from 'react'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useProfile, useUpdateProfile } from '@/features/account/hooks'
import type { Profile } from '@/types/api'

export function PersonalInformationPage() {
  const { data: profile, isPending, isError, error, refetch } = useProfile()

  if (isPending) return <LoadingState label="Loading your details" />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />
  return <PersonalInformationForm profile={profile} />
}

function PersonalInformationForm({ profile }: { profile: Profile }) {
  const update = useUpdateProfile()
  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    update.mutate({ firstName, lastName, marketingEmails: profile.marketingEmails })
  }

  return (
    <>
      <h1 className="font-display text-3xl text-primary">Personal information</h1>
      <form onSubmit={submit} className="mt-8 max-w-lg space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="First name" autoComplete="given-name" maxLength={100} value={firstName} onChange={setFirstName} />
          <Input label="Last name" autoComplete="family-name" maxLength={100} value={lastName} onChange={setLastName} />
        </div>
        <Input label="Email" type="email" value={profile.email} isReadOnly hint="Your sign-in email. Contact us if it needs to change." />
        <div className="flex items-center gap-4">
          <Button type="submit" size="md" isLoading={update.isPending}>
            Save changes
          </Button>
          <p aria-live="polite" className="text-sm text-tertiary">
            {update.isSuccess && 'Saved.'}
            {update.isError && <span className="text-error-primary">Could not save. Please try again.</span>}
          </p>
        </div>
      </form>
      <p className="mt-10 text-xs text-tertiary">
        Member since {new Date(profile.createdAt).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}. We only store what we need to deliver your orders.
      </p>
    </>
  )
}
