import { Component, type ReactNode, type ErrorInfo } from 'react'

// ─── ErrorBoundary ────────────────────────────────────────────────────────────
//
// Catches any unhandled render error and shows a recovery screen instead of a
// blank white page.  Also logs the error + component stack to console so it
// appears in Vercel's logs and browser DevTools — helping pinpoint the crash.

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  info: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Visible in Vercel runtime logs and browser DevTools.
    console.error('[ErrorBoundary] Render crash:', error.message)
    console.error('[ErrorBoundary] Stack:', error.stack)
    console.error('[ErrorBoundary] Component stack:', info.componentStack)
    this.setState({ info })
  }

  handleReload = () => {
    try { localStorage.clear() } catch { /* ignore */ }
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const msg = this.state.error?.message ?? 'Unknown error'
    const stack = this.state.info?.componentStack ?? ''

    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#1E1B2E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'Nunito, sans-serif',
          color: '#F9FAFB',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 56 }}>😔</div>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
          משהו השתבש / Something went wrong
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', margin: 0 }}>
          {msg}
        </p>

        {/* Dev-mode stack — useful to copy from Vercel screenshots / logs */}
        {stack && (
          <pre
            style={{
              fontSize: 10,
              color: '#6B7280',
              maxWidth: 340,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              background: '#0d0b1a',
              padding: 8,
              borderRadius: 8,
              maxHeight: 160,
            }}
          >
            {stack.trim()}
          </pre>
        )}

        <button
          onClick={this.handleReload}
          style={{
            marginTop: 8,
            padding: '14px 32px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          🔄 נסי שוב / Reload
        </button>
      </div>
    )
  }
}
