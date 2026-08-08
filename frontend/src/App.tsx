import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
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
              <Route path="/product/:id" element={<Placeholder title="Product detail" />} />
              <Route path="/login" element={<Placeholder title="Log in" />} />
              <Route path="/register" element={<Placeholder title="Register" />} />
              <Route path="/cart" element={<Placeholder title="Your cart" />} />
              <Route path="/profile" element={<Placeholder title="Profile" />} />
              <Route path="/admin" element={<Placeholder title="Admin dashboard" />} />
              <Route path="/admin/product/new" element={<Placeholder title="New product" />} />
              <Route path="/admin/product/:id/edit" element={<Placeholder title="Edit product" />} />
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
