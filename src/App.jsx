import { useAuthenticationStatus } from '@nhost/react'
import { Suspense } from 'react'
import AppRoutes from './routes.jsx'

function AppContent() {
  const { isLoading } = useAuthenticationStatus()

  if (isLoading) {
    return (
      <div style={{ 
        display: 'grid', 
        placeItems: 'center', 
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }}></div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Loading AI Chatbot...</div>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>
            Setting up your chat experience
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div style={{ 
        display: 'grid', 
        placeItems: 'center', 
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 12px' }}></div>
          <div style={{ fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    }>
      <AppRoutes />
    </Suspense>
  )
}

export default function App() {
  return <AppContent />
}
