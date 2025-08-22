import { useState } from 'react'
import { useAuthenticationStatus } from '@nhost/react'
import nhost from '../nhost'
import { Navigate } from 'react-router-dom'

export default function AuthPage() {
  const { isAuthenticated } = useAuthenticationStatus()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('signin')

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'signup') {
        const res = await nhost.auth.signUp({ email, password })
        if (res.error) throw res.error
      } else {
        const res = await nhost.auth.signIn({ email, password })
        if (res.error) throw res.error
      }
    } catch (err) {
      setError(err?.message || 'Authentication failed')
    }
  }

  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: 380 }}>
        <div style={{ marginBottom: 12 }}>
          <div className="title">{mode === 'signup' ? 'Create account' : 'Sign In'}</div>
          <div className="label">Use your email and password</div>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
          {error && <div className="error" role="alert">{error}</div>}
          <button className="btn primary" type="submit">{mode === 'signup' ? 'Create account' : 'Sign in'}</button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <button className="btn ghost" type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
            {mode === 'signup' ? 'Have an account? Sign in' : 'New here? Create an account'}
          </button>
        </div>
      </div>
    </div>
  )
}



