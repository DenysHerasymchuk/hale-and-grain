import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { authApi } from '@/features/auth/api'
import { ApiError } from '@/lib/apiClient'
import { routePaths } from '@/Routes/routePaths'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const code = searchParams.get('code') ?? ''
  const [password, setPassword] = useState('')
  const reset = useMutation({ mutationFn: () => authApi.resetPassword(email, code, password) })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    reset.mutate()
  }

  if (!email || !code) {
    return (
      <>
        <h1 className="font-display text-4xl text-primary">Link incomplete</h1>
        <p className="mt-4 text-secondary">This reset link is missing information. Request a new one and use the full link from the email.</p>
        <Link to={routePaths.forgotPassword} className="mt-8 inline-block font-medium text-brand-700 hover:underline">
          Request a new link
        </Link>
      </>
    )
  }

  if (reset.isSuccess) {
    return (
      <>
        <h1 className="font-display text-4xl text-primary">Password updated</h1>
        <p className="mt-4 text-secondary">You can now sign in with your new password.</p>
        <Button href={routePaths.login} size="lg" className="mt-8">
          Sign in
        </Button>
      </>
    )
  }

  return (
    <>
      <h1 className="font-display text-4xl text-primary">Choose a new password</h1>
      <p className="mt-2 text-tertiary">For {email}</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Input label="New password" type="password" autoComplete="new-password" isRequired value={password} onChange={setPassword} hint="At least 10 characters, with upper- and lower-case letters and a number." />
        {reset.error && (
          <p role="alert" className="text-sm text-error-primary">
            {reset.error instanceof ApiError ? reset.error.messages.join(' ') : 'Something went wrong.'} The link may have expired; you can request a new one.
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" isLoading={reset.isPending}>
          Update password
        </Button>
      </form>
    </>
  )
}
