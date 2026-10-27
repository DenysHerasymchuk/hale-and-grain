import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { authApi } from '@/features/auth/api'
import { safeReturnPath } from '@/features/auth/safeReturnPath'
import { useLogin } from '@/features/auth/useSession'
import { ApiError } from '@/lib/apiClient'
import { routePaths } from '@/Routes/routePaths'

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const register = useMutation({
    mutationFn: () => authApi.register({ email: email.trim(), password }),
    // Sign straight in; email confirmation is only required for password resets.
    onSuccess: () =>
      login.mutate({ email: email.trim(), password }, { onSuccess: () => void navigate(safeReturnPath(searchParams.get('returnTo')), { replace: true }) }),
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    register.mutate()
  }

  const errors = register.error instanceof ApiError ? register.error.messages : register.error ? ['Something went wrong. Please try again.'] : []

  return (
    <>
      <h1 className="font-display text-4xl text-primary">Create your account</h1>
      <p className="mt-2 text-tertiary">Track orders, save addresses and keep a wishlist across devices.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Input label="Email" type="email" autoComplete="email" isRequired value={email} onChange={setEmail} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          isRequired
          minLength={10}
          value={password}
          onChange={setPassword}
          hint="At least 10 characters, with upper- and lower-case letters and a number."
        />
        {errors.length > 0 && (
          <ul role="alert" className="space-y-1 text-sm text-error-primary">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
        <Button type="submit" size="lg" className="w-full" isLoading={register.isPending || login.isPending}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-sm text-secondary">
        Already have an account?{' '}
        <Link to={routePaths.login} className="font-medium text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
