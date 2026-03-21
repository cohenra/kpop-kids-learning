import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ─── Global error logger (pre-React) ─────────────────────────────────────────
// Catches any crash that happens before or outside React's error boundary,
// and makes it visible as a page message instead of a blank screen.
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[global onerror]', { message, source, lineno, colno, stack: error?.stack })
  const root = document.getElementById('root')
  if (root && root.childElementCount === 0) {
    root.innerHTML = `
      <div style="min-height:100dvh;background:#1E1B2E;display:flex;flex-direction:column;
                  align-items:center;justify-content:center;padding:24px;font-family:Nunito,sans-serif;
                  color:#F9FAFB;gap:12px;text-align:center">
        <div style="font-size:52px">😔</div>
        <h1 style="font-size:22px;font-weight:bold;margin:0">שגיאה / App Error</h1>
        <pre style="font-size:11px;color:#9CA3AF;max-width:340px;white-space:pre-wrap;
                    background:#0d0b1a;padding:10px;border-radius:8px;text-align:left">
${String(message)}\n${source}:${lineno}:${colno}</pre>
        <button onclick="localStorage.clear();location.reload()"
          style="padding:14px 32px;border-radius:24px;background:linear-gradient(135deg,#7C3AED,#EC4899);
                 color:white;font-weight:bold;font-size:18px;border:none;cursor:pointer;margin-top:8px">
          🔄 נסי שוב / Reload
        </button>
      </div>`
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
