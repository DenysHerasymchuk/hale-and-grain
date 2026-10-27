import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ModelErrorBoundaryProps {
  fallback: (error: Error) => ReactNode
  children: ReactNode
}

interface ModelErrorBoundaryState {
  error: Error | null
}

export class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  state: ModelErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ModelErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('3D viewer failed', error, info.componentStack)
  }

  render() {
    return this.state.error ? this.props.fallback(this.state.error) : this.props.children
  }
}
