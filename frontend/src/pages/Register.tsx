import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { registerSchema, type RegisterValues } from '../lib/schemas'
import { useAuth } from '../auth/AuthProvider'
import { HttpError } from '../api/client'
import AuthShell from './AuthShell'
import { useToast } from '../components/Toast'

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      firstName: '',
      lastName: '',
      city: '',
      gender: '',
      age: undefined,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setServerFieldErrors({})
    try {
      await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        city: values.city || undefined,
        gender: values.gender,
        age: values.age,
      })
      toast('Account created — welcome aboard!')
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof HttpError && error.fieldErrors) {
        setServerFieldErrors(error.fieldErrors)
      } else {
        setServerError(error instanceof Error ? error.message : 'Registration failed')
      }
    }
  })

  const fieldError = (name: string) => errors[name as keyof RegisterValues]?.message || serverFieldErrors[name]

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the atelier — it takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-gold-400 underline-offset-2 hover:underline">
            Log in
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
          <label htmlFor="r-username" className="mb-1.5 block text-sm text-cream">
            Username
          </label>
          <input
            id="r-username"
            autoComplete="username"
            className="input"
            placeholder="4–32 characters"
            {...register('username')}
          />
          {fieldError('username') && (
            <p className="mt-1 text-xs text-danger">{fieldError('username')}</p>
          )}
        </div>

        <div>
          <label htmlFor="r-email" className="mb-1.5 block text-sm text-cream">
            Email
          </label>
          <input
            id="r-email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            {...register('email')}
          />
          {fieldError('email') && <p className="mt-1 text-xs text-danger">{fieldError('email')}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="r-first" className="mb-1.5 block text-sm text-cream">
              First name
            </label>
            <input id="r-first" autoComplete="given-name" className="input" placeholder="Ada" {...register('firstName')} />
          </div>
          <div>
            <label htmlFor="r-last" className="mb-1.5 block text-sm text-cream">
              Last name
            </label>
            <input id="r-last" autoComplete="family-name" className="input" placeholder="Lovelace" {...register('lastName')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="r-city" className="mb-1.5 block text-sm text-cream">
              City
            </label>
            <input id="r-city" autoComplete="address-level2" className="input" placeholder="Paris" {...register('city')} />
          </div>
          <div>
            <label htmlFor="r-gender" className="mb-1.5 block text-sm text-cream">
              Gender
            </label>
            <select id="r-gender" className="input" {...register('gender')}>
              <option value="">Select…</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
            {fieldError('gender') && <p className="mt-1 text-xs text-danger">{fieldError('gender')}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="r-age" className="mb-1.5 block text-sm text-cream">
            Age
          </label>
          <input
            id="r-age"
            type="number"
            inputMode="numeric"
            className="input"
            placeholder="Over 13"
            {...register('age')}
          />
          {fieldError('age') && <p className="mt-1 text-xs text-danger">{fieldError('age')}</p>}
        </div>

        <div>
          <label htmlFor="r-password" className="mb-1.5 block text-sm text-cream">
            Password
          </label>
          <div className="relative">
            <input
              id="r-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="input pr-12"
              placeholder="8–32 characters"
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
          {fieldError('password') && <p className="mt-1 text-xs text-danger">{fieldError('password')}</p>}
        </div>

        <div>
          <label htmlFor="r-confirm" className="mb-1.5 block text-sm text-cream">
            Confirm password
          </label>
          <input
            id="r-confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="input"
            placeholder="Repeat your password"
            {...register('passwordConfirm')}
          />
          {fieldError('passwordConfirm') && (
            <p className="mt-1 text-xs text-danger">{fieldError('passwordConfirm')}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-3">
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
