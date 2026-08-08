import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = nextId++
      setToasts((current) => [...current, { id, type, message }])
      window.setTimeout(() => remove(id), 3500)
    },
    [remove],
  )

  const value = useMemo(() => ({ toast }), [toast])

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />,
    error: <AlertCircle className="h-5 w-5 shrink-0 text-danger" />,
    info: <Info className="h-5 w-5 shrink-0 text-gold-400" />,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => remove(t.id)}
              className="pointer-events-auto flex w-72 cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-ink-800/95 p-3 shadow-soft backdrop-blur"
            >
              {icons[t.type]}
              <p className="text-sm leading-snug text-cream">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
