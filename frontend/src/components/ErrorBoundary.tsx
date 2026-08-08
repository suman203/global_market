import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <p className="font-display text-6xl font-semibold text-gold-400">Oops</p>
          <h1 className="mt-2 font-display text-2xl text-cream">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-mist">
            An unexpected error interrupted the journey. Reload to pick up where you left off.
          </p>
          <button onClick={() => window.location.reload()} className="btn-gold mt-7">
            <RotateCcw className="h-4 w-4" /> Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
