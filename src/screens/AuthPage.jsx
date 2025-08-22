import { useState } from 'react'
import { useAuthenticationStatus } from '@nhost/react'
import nhost from '../nhost'
import { Navigate } from 'react-router-dom'

export default function AuthPage() {
  const { isAuthenticated } = useAuthenticationStatus()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mode, setMode] = useState('signin')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      if (mode === 'signup') {
        const res = await nhost.auth.signUp({ email, password })
        if (res.error) throw res.error
        setSuccess('Account created! Please check your email to verify your account.')
        setMode('signin')
      } else {
        const res = await nhost.auth.signIn({ email, password })
        if (res.error) throw res.error
        setSuccess('Signed in successfully!')
      }
    } catch (err) {
      setError(err?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'signup' ? 'signin' : 'signup')
    setError('')
    setSuccess('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="app-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: 380 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="title">{mode === 'signup' ? 'Create account' : 'Sign In'}</div>
          <div className="label">
            {mode === 'signup' 
              ? 'Join us to start chatting with AI' 
              : 'Welcome back! Sign in to continue'
            }
          </div>
        </div>
        
        {error && (
          <div className="error-banner" style={{ marginBottom: 16 }}>
            <span>{error}</span>
            <button className="btn ghost" onClick={() => setError('')}>×</button>
          </div>
        )}
        
        {success && (
          <div className="message success" style={{ marginBottom: 16 }}>
            {success}
          </div>
        )}
        
        <form className="form" onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">Email</label>
          <input 
            id="email" 
            className="input" 
            type="email" 
            placeholder="you@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            autoComplete="email"
            disabled={loading}
          />
          
          <label className="label" htmlFor="password">Password</label>
          <input 
            id="password" 
            className="input" 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            disabled={loading}
          />
          
          <button 
            className="btn primary" 
            type="submit" 
            disabled={loading || !email.trim() || !password.trim()}
            style={{ marginTop: 8 }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, margin: '0 8px 0 0' }}></div>
                {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              mode === 'signup' ? 'Create account' : 'Sign in'
            )}
          </button>
        </form>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button 
            className="btn ghost" 
            type="button" 
            onClick={switchMode}
            disabled={loading}
          >
            {mode === 'signup' ? 'Have an account? Sign in' : 'New here? Create an account'}
          </button>
        </div>
        
        {mode === 'signin' && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <div className="label" style={{ fontSize: 12, opacity: 0.7 }}>
              Demo: Use any email/password to test
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



