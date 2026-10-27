import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'
import { safeReturnPath } from '@/features/auth/safeReturnPath'
import { useLogin } from '@/features/auth/useSession'
import { ApiError } from '@/lib/apiClient'
import { routePaths } from '@/Routes/routePaths'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    login.mutate({ email: email.trim(), password }, { onSuccess: () => void navigate(safeReturnPath(searchParams.get('returnTo')), { replace: true }) })
  }

  const error = login.error instanceof ApiError && login.error.status === 401 ? 'That email and password combination did not work.' : login.error ? 'Sign-in failed. Please try again.' : null

  return (
    <>
      <h1 className="font-display text-4xl text-primary">Welcome back</h1>
      <p className="mt-2 text-tertiary">Sign in to see your orders, addresses and saved pieces.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Input label="Email" type="email" autoComplete="email" isRequired value={email} onChange={setEmail} />
        <Input label="Password" type="password" autoComplete="current-password" isRequired value={password} onChange={setPassword} />
        {error && (
          <p role="alert" className="text-sm text-error-primary">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" isLoading={login.isPending}>
          Sign in
        </Button>
      </form>
      <div className="mt-6 flex justify-between text-sm">
        <Link to={routePaths.forgotPassword} className="text-secondary hover:text-primary hover:underline">
          Forgot password?
        </Link>
        <Link to={`${routePaths.register}${searchParams.size ? `?${searchParams}` : ''}`} className="font-medium text-brand-700 hover:underline">
          Create an account
        </Link>
      </div>
    </>
  )
}
