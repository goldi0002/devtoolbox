import { Component, type ErrorInfo, type ReactNode } from 'react'
import { getErrorMessage, reportError } from '../utils/errors'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Shown in the fallback heading, e.g. the tool name. */
  label?: string
}

interface ErrorBoundaryState {
  error: unknown
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    reportError(`${this.props.label ?? 'Render'} failed${info.componentStack ? `\n${info.componentStack}` : ''}`, error)
  }

  private reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="border border-border rounded-lg p-6 bg-surface space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <h2 className="text-bright font-sans font-medium text-sm">
            {this.props.label ? `${this.props.label} crashed` : 'Something went wrong'}
          </h2>
        </div>
        <p className="font-mono text-xs text-dim break-words">{getErrorMessage(error)}</p>
        <p className="text-xs font-sans text-subtle">
          Your data never left the browser. Try again, or reload the page if the problem persists.
        </p>
        <button onClick={this.reset} className="btn-ghost text-xs">
          Try again
        </button>
      </div>
    )
  }
}
