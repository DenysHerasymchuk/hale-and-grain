import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { authApi } from '@/features/auth/api'
import { routePaths } from '@/Routes/routePaths'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const request = useMutation({ mutationFn: () => authApi.forgotPassword(email.trim()) })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    request.mutate()
  }

  if (request.isSuccess) {
    return (
      <>
        <h1 className="font-display text-4xl text-primary">Check your inbox</h1>
        {/* Same message whether or not the account exists, so emails can't be enumerated. */}
        <p className="mt-4 text-secondary">
          If <strong>{email}</strong> belongs to an account with a confirmed email address, a reset link is on its way.
        </p>
        <Link to={routePaths.login} className="mt-8 inline-block font-medium text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="font-display text-4xl text-primary">Reset your password</h1>
      <p className="mt-2 text-tertiary">Enter your account email and we&rsquo;ll send you a link to choose a new password.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Input label="Email" type="email" autoComplete="email" isRequired value={email} onChange={setEmail} />
        {request.isError && (
          <p role="alert" className="text-sm text-error-primary">
            We couldn&rsquo;t send the link just now. Please try again.
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" isLoading={request.isPending}>
          Send reset link
        </Button>
      </form>
      <Link to={routePaths.login} className="mt-6 inline-block text-sm text-secondary hover:underline">
        Back to sign in
      </Link>
    </>
  )
}
