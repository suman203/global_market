import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from '../auth/AuthProvider'
import RequireAuth from './RequireAuth'
import type { User } from '../types/api'

const mocks = vi.hoisted(() => ({ me: vi.fn() }))

vi.mock('../api/endpoints', () => ({
  api: { auth: { me: mocks.me } },
}))

const adminUser: User = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  age: 30,
  gender: 'Male',
  role: 'ADMIN',
}

const regularUser: User = {
  id: 2,
  username: 'user',
  email: 'user@example.com',
  age: 25,
  gender: 'Female',
  role: 'USER',
}

function LoginPage() {
  const [params] = useSearchParams()
  return <div>login-page from={params.get('from')}</div>
}

function renderGuarded(ui: ReactNode, initialPath = '/cart') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>home-page</div>} />
          <Route path="/admin" element={<div>admin-page</div>} />
          <Route path="/cart" element={ui} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('RequireAuth', () => {
  it('redirects an anonymous visitor to /login with the from path', async () => {
    mocks.me.mockResolvedValue(null)
    renderGuarded(
      <RequireAuth role="USER">
        <div>secret-content</div>
      </RequireAuth>,
    )
    await screen.findByText('login-page from=/cart')
    expect(screen.queryByText('secret-content')).not.toBeInTheDocument()
  })

  it('renders children for an authenticated user', async () => {
    mocks.me.mockResolvedValue(regularUser)
    renderGuarded(
      <RequireAuth role="USER">
        <div>secret-content</div>
      </RequireAuth>,
    )
    await screen.findByText('secret-content')
  })

  it('sends a user without the required role to home', async () => {
    mocks.me.mockResolvedValue(regularUser)
    renderGuarded(
      <RequireAuth role="ADMIN">
        <div>secret-content</div>
      </RequireAuth>,
    )
    await screen.findByText('home-page')
    expect(screen.queryByText('secret-content')).not.toBeInTheDocument()
  })

  it('sends an admin to the admin dashboard on a user-only route', async () => {
    mocks.me.mockResolvedValue(adminUser)
    renderGuarded(
      <RequireAuth role="USER">
        <div>secret-content</div>
      </RequireAuth>,
    )
    await screen.findByText('admin-page')
  })

  it('allows an admin onto an admin route', async () => {
    mocks.me.mockResolvedValue(adminUser)
    renderGuarded(
      <RequireAuth role="ADMIN">
        <div>secret-content</div>
      </RequireAuth>,
    )
    await screen.findByText('secret-content')
  })

  it('shows a loader while the session is being resolved', async () => {
    let resolveMe: (value: User | null) => void = () => {}
    mocks.me.mockImplementation(
      () =>
        new Promise<User | null>((resolve) => {
          resolveMe = resolve
        }),
    )
    renderGuarded(
      <RequireAuth role="ADMIN">
        <div>secret-content</div>
      </RequireAuth>,
    )
    expect(document.querySelector('[class*="animate-spin"]')).not.toBeNull()
    expect(screen.queryByText('secret-content')).not.toBeInTheDocument()

    resolveMe(adminUser)
    await waitFor(() => expect(screen.getByText('secret-content')).toBeInTheDocument())
  })
})
