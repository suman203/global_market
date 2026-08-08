import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { loginSchema, type LoginValues } from '../lib/schemas'
import { useAuth } from '../auth/AuthProvider'
import AuthShell from './AuthShell'
import { useToast } from '../components/Toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const from = searchParams.get('from') || '/'

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      await login(values)
      toast('Welcome back!')
      navigate(from, { replace: true })
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Login failed')
    }
  })

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue your journey."
      footer={
        <>
          New to Global Market?{' '}
          <Link to="/register" className="text-gold-400 underline-offset-2 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-red-300">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm text-cream">
            Username
          </label>
          <input
            id="username"
            autoComplete="username"
            className="input"
            placeholder="Your username"
            {...register('username')}
          />
          {errors.username && <p className="mt-1 text-xs text-danger">{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-cream">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="input pr-12"
              placeholder="Your password"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-mist transition-colors hover:text-cream"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-3">
          <LogIn className="h-4 w-4" />
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>

        <p className="rounded-lg border border-white/5 bg-ink-950/60 px-4 py-3 text-center text-xs text-mist">
          Demo accounts — <span className="text-gold-400">admin / admin</span> ·{' '}
          <span className="text-gold-400">user / user</span>
        </p>
      </form>
    </AuthShell>
  )
}
