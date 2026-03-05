import { useState, useEffect, useRef } from 'react'
import { FaCertificate, FaDownload, FaSearch, FaRedo, FaShieldAlt } from 'react-icons/fa'
import { verifyCertificate, getCertificateDownloadUrl } from '../appwrite'

// ─── Math Captcha Generator ───────────────────────────────────────────────────
function generateCaptcha() {
  const ops = ['+', '-', '×']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a, b, answer
  if (op === '+') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; answer = a + b }
  else if (op === '-') { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * 10) + 1; answer = a - b }
  else { a = Math.floor(Math.random() * 9) + 2; b = Math.floor(Math.random() * 9) + 2; answer = a * b }
  return { question: `${a} ${op} ${b} = ?`, answer: String(answer) }
}

export default function Certificate() {
  const [step, setStep] = useState('form') // form | result
  const [form, setForm] = useState({ name: '', enrollmentNo: '', captchaAnswer: '' })
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cert, setCert] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [blockTimer, setBlockTimer] = useState(0)
  const ref = useRef()
  const timerRef = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    ref.current?.querySelectorAll('.fade-in').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [step])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha())
    setForm(f => ({ ...f, captchaAnswer: '' }))
  }

  const startBlockTimer = (seconds) => {
    setBlocked(true)
    setBlockTimer(seconds)
    timerRef.current = setInterval(() => {
      setBlockTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setBlocked(false)
          setAttempts(0)
          refreshCaptcha()
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (blocked) return

    // Captcha check
    if (form.captchaAnswer.trim() !== captcha.answer) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      refreshCaptcha()
      if (newAttempts >= 3) {
        startBlockTimer(60)
        setError('Too many failed attempts. Please wait 60 seconds before trying again.')
        return
      }
      setError(`Incorrect answer. ${3 - newAttempts} attempt(s) remaining.`)
      return
    }

    if (!form.name.trim() || !form.enrollmentNo.trim()) {
      setError('Please fill in all fields.'); return
    }

    setLoading(true)
    try {
      const result = await verifyCertificate(form.enrollmentNo)
      if (!result) {
        setError('No certificate found for this Enrollment Number. Please check and try again.')
        refreshCaptcha()
        setLoading(false)
        return
      }

      // Verify name loosely (case-insensitive, partial match)
      const storedName = (result.studentName || '').toLowerCase().replace(/\s+/g, '')
      const inputName  = form.name.toLowerCase().replace(/\s+/g, '')
      if (storedName && inputName && !storedName.includes(inputName) && !inputName.includes(storedName)) {
        setError('Name does not match our records. Please check and try again.')
        refreshCaptcha()
        setLoading(false)
        return
      }

      const url = getCertificateDownloadUrl(result.fileId)
      setCert(result)
      setDownloadUrl(String(url))
      setStep('result')
    } catch (err) {
      setError('Verification failed. Please try again.')
      console.error(err)
    }
    setLoading(false)
  }

  const reset = () => {
    setStep('form')
    setCert(null)
    setDownloadUrl('')
    setError('')
    setForm({ name: '', enrollmentNo: '', captchaAnswer: '' })
    setAttempts(0)
    setCaptcha(generateCaptcha())
  }

  return (
    <section id="certificate" ref={ref} className="section" style={{
      background: 'rgba(10,22,40,0.45)',
      borderTop: '1px solid rgba(201,168,76,0.15)',
      borderBottom: '1px solid rgba(201,168,76,0.15)',
    }}>
      <div className="container">
        <div className="fade-in">
          <div className="gold-line" />
          <h2 className="section-title">Certificate Verification</h2>
          <p className="section-subtitle">
            Verify and download your official course certificate issued by Raj Institute of Medical Sciences.
          </p>
        </div>

        {step === 'form' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, alignItems: 'start' }} className="cert-grid">
            {/* Info panel */}
            <div className="fade-in">
              <div style={{
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: 16, padding: 32,
              }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>🎓</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--white)', marginBottom: 12 }}>
                  Your Achievement Awaits
                </h3>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 24 }}>
                  Download your official certificate in PDF format. Certificates are issued for all successfully completed courses under UGC Approved Universities, GSDM and NSDM.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: '📋', text: 'Valid for all paramedical & computer courses' },
                    { icon: '🔒', text: 'Secure CAPTCHA-protected access' },
                    { icon: '📄', text: 'Instant PDF download' },
                    { icon: '✅', text: 'Digitally verified by institute' },
                  ].map(i => (
                    <div key={i.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.86rem', color: 'var(--gray-400)' }}>
                      <span style={{ fontSize: '1rem' }}>{i.icon}</span> {i.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification form */}
            <div className="fade-in card" style={{ padding: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <FaSearch style={{ color: 'var(--teal-light)', fontSize: '1.1rem' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Get Certificate</h3>
              </div>

              {blocked ? (
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, padding: '20px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔒</div>
                  <p style={{ color: '#fca5a5', fontWeight: 600, marginBottom: 6 }}>Access Temporarily Blocked</p>
                  <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginBottom: 12 }}>Too many failed CAPTCHA attempts.</p>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--teal-light)',
                  }}>{blockTimer}s</div>
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.78rem' }}>Please wait before retrying</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Full Name (as on certificate)</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Kumar Singh"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-group">
                    <label>Enrollment Number</label>
                    <input
                      type="text"
                      placeholder="e.g. RIMS2024001"
                      value={form.enrollmentNo}
                      onChange={e => setForm({ ...form, enrollmentNo: e.target.value.toUpperCase() })}
                      autoComplete="off"
                      style={{ fontFamily: 'monospace', letterSpacing: '0.08em', fontSize: '1rem' }}
                    />
                  </div>

                  {/* Math CAPTCHA */}
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FaShieldAlt style={{ color: 'var(--teal-light)', fontSize: '0.85rem' }} />
                      Security Verification
                    </label>
                    <div style={{
                      background: 'rgba(10,22,40,0.8)', border: '1.5px solid rgba(14,116,144,0.3)',
                      borderRadius: 8, padding: '14px 20px', marginBottom: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>Solve:</span>
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: '1.6rem',
                          color: 'var(--gold-light)', fontWeight: 700, letterSpacing: '0.05em',
                        }}>{captcha.question}</span>
                      </div>
                      <button type="button" onClick={refreshCaptcha} title="New question" style={{
                        background: 'rgba(14,116,144,0.15)', border: '1px solid rgba(14,116,144,0.3)',
                        borderRadius: 6, padding: '6px 10px', color: 'var(--teal-light)',
                        cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s',
                      }}>
                        <FaRedo />
                      </button>
                    </div>
                    <input
                      type="number"
                      placeholder="Your answer"
                      value={form.captchaAnswer}
                      onChange={e => setForm({ ...form, captchaAnswer: e.target.value })}
                      autoComplete="off"
                    />
                    {attempts > 0 && !blocked && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--gold-light)', marginTop: 6 }}>
                        ⚠ {attempts}/3 failed attempts
                      </p>
                    )}
                  </div>

                  {error && (
                    <div style={{
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                      color: '#fca5a5', fontSize: '0.85rem',
                    }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}>
                    {loading ? (
                      <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Verifying...</>
                    ) : (
                      <><FaSearch /> Verify & Get Certificate</>
                    )}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: 12 }}>
                    🔒 Your data is never shared or stored during verification
                  </p>
                </form>
              )}
            </div>
          </div>
        ) : (
          // Result / Download screen
          <div className="fade-in" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 20, padding: 40, textAlign: 'center',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎓</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--white)', marginBottom: 8 }}>
                Certificate Found!
              </h3>
              <p style={{ color: '#6ee7b7', marginBottom: 28, fontSize: '0.9rem' }}>
                Your certificate has been verified successfully.
              </p>

              {/* Certificate Info Card */}
              <div style={{
                background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(14,116,144,0.2)',
                borderRadius: 12, padding: '20px 28px', marginBottom: 28, textAlign: 'left',
              }}>
                {[
                  { label: 'Student Name', value: cert?.studentName || form.name },
                  { label: 'Enrollment No.', value: cert?.enrollmentNo },
                  { label: 'Issued Date', value: cert?.issuedDate ? new Date(cert.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                  { label: 'Institute', value: 'Raj Institute of Medical Sciences' },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid rgba(14,116,144,0.1)',
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--white)', fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <a
                href={downloadUrl}
                download={`Certificate_${cert?.enrollmentNo}.pdf`}
                className="btn btn-gold"
                style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '14px', marginBottom: 14 }}
              >
                <FaDownload /> Download Certificate (PDF)
              </a>

              <button onClick={reset} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem' }}>
                ← Verify Another Certificate
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .cert-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
