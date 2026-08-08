import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import AdminDashboard from './pages/AdminDashboard'
import AdminProductForm from './pages/AdminProductForm'
import NotFound from './pages/NotFound'
import Placeholder from './pages/Placeholder'

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar onOpenCart={() => setDrawerOpen(true)} />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/profile"
                element={
                  <RequireAuth role="USER">
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAuth role="ADMIN">
                    <AdminDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/product/new"
                element={
                  <RequireAuth role="ADMIN">
                    <AdminProductForm />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/product/:id/edit"
                element={
                  <RequireAuth role="ADMIN">
                    <AdminProductForm />
                  </RequireAuth>
                }
              />
              <Route path="/about" element={<Placeholder title="About" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}
