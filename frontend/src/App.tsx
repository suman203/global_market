import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './auth/AuthProvider'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import RequireAuth from './components/RequireAuth'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import AdminDashboard from './pages/AdminDashboard'
import AdminProductForm from './pages/AdminProductForm'
import About from './pages/About'
import NotFound from './pages/NotFound'

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <div className="flex min-h-screen flex-col">
            <Navbar onOpenCart={() => setDrawerOpen(true)} />
            <main className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <Routes location={location}>
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
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
          <Footer />
          <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          </div>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  )
}
