import { useState, useEffect, useRef } from 'react'
import { FaFlask, FaTimes, FaCheckCircle } from 'react-icons/fa'
import { createBloodRequest } from '../appwrite'

export default function BloodTest() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.15 })
    ref.current?.querySelectorAll('.fade-in').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.address || !form.phone) {
      setError('Please fill in Name, Address and Phone.'); return
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Please enter a valid email address.'); return
    }
    setLoading(true)
    try {
      await createBloodRequest(form)
      setSuccess(true)
      setForm({ name: '', address: '', phone: '', email: '' })
      setTimeout(() => { setSuccess(false); setOpen(false) }, 3500)
    } catch (err) {
      setError('Failed to submit request. Please try again.')
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <section id="blood-test" ref={ref} className="section" style={{
      background: 'rgba(10,22,40,0.4)',
      borderTop: '1px solid rgba(14,116,144,0.1)',
      borderBottom: '1px solid rgba(14,116,144,0.1)',
    }}>
      <div className="container">
        <div className="fade-in">
          <div className="gold-line" />
          <h2 className="section-title">Blood Test Services</h2>
          <p className="section-subtitle">
            Full Body Checkup — Blood &amp; Urine tests done on-site. Book your appointment from home.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {services.map((s, i) => (
            <div key={s.name} className="card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>{s.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 8, color: 'var(--white)' }}>{s.name}</h3>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem', marginBottom: 20, lineHeight: 1.6 }}>{s.desc}</p>
              <button className="btn btn-gold" onClick={() => setOpen(true)} style={{ width: '100%', justifyContent: 'center' }}>
                <FaFlask /> Book Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {open && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Book Blood Test</h3>
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none', color: 'var(--gray-400)',
                fontSize: '1.3rem', cursor: 'pointer',
              }}><FaTimes /></button>
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <FaCheckCircle style={{ fontSize: '3rem', color: '#10b981', marginBottom: 16 }} />
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 10 }}>Request Submitted!</h4>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  We'll review your request and contact you shortly.
                </p>
                {form.email === '' && (
                  <p style={{ color: 'var(--teal-light)', fontSize: '0.82rem', marginTop: 8 }}>
                    📧 You'll receive an email confirmation once your slot is accepted.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text" placeholder="Enter your full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    placeholder="Enter your complete address"
                    rows={2}
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    style={{ resize: 'none' }}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel" placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Email Address</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--teal-light)', fontWeight: 400 }}>
                      📧 Get confirmation when accepted
                    </span>
                  </label>
                  <input
                    type="email" placeholder="yourname@gmail.com (optional)"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                {error && <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: 14 }}>{error}</p>}

                <button type="submit" className="btn btn-gold" disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '13px' }}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', textAlign: 'center', marginTop: 10 }}>
                  🔒 No login required. Your data is private and secure.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

const services = [
  { icon: '🩸', name: 'Complete Blood Count',  desc: 'Full CBC panel including RBC, WBC, platelets and hemoglobin analysis.' },
  { icon: '🔬', name: 'Biochemistry Tests',    desc: 'Liver function, kidney function, lipid profile and blood glucose levels.' },
  { icon: '💉', name: 'Hormone Tests',         desc: 'Thyroid, diabetes, vitamin deficiency and hormone level assessments.' },
  { icon: '🧬', name: 'Pathology Tests',       desc: 'Urine analysis, stool tests and other clinical pathology investigations.' },
  { icon: '❤️', name: 'Cardiac Markers',       desc: 'Troponin, CK-MB and other cardiac risk markers for heart health.' },
  { icon: '🦠', name: 'Infection Screening',   desc: 'Dengue, malaria, typhoid, COVID and other infectious disease panels.' },
]
