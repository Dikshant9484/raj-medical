import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa'
import { adminLogin, getAdminSession } from '../appwrite'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getAdminSession().then(user => {
      if (user) navigate('/admin/dashboard')
    })
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please fill in all fields.'); return
    }
    setLoading(true)
    try {
      await adminLogin(form.email, form.password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--navy)', position: 'relative', overflow: 'hidden', padding: 24,
    }}>
      <div className="ambient-bg"><div className="orb-3" /></div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--teal), #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '1.6rem',
          }}>
            <FaLock style={{ color: 'white' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--white)', marginBottom: 6 }}>
            Admin Panel
          </h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem' }}>
            RAJ INSTITUTE OF MEDICAL SCIENCES
          </p>
        </div>

        <div className="modal" style={{ maxWidth: '100%' }}>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--gray-600)', fontSize: '0.9rem',
                }} />
                <input
                  type="email" placeholder="admin@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--gray-600)', fontSize: '0.9rem',
                }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--gray-600)', cursor: 'pointer',
                }}>
                  {showPw ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: '#fca5a5', fontSize: '0.85rem',
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.8rem', color: 'var(--gray-600)' }}>
            <a href="/" style={{ color: 'var(--teal-light)', textDecoration: 'none' }}>← Back to Website</a>
          </p>
        </div>
      </div>
    </div>
  )
}
