import { useEffect, useRef, useState } from 'react'
import { FaCheckCircle, FaFlask, FaTimes } from 'react-icons/fa'
import { getPackages, getImagePreviewUrl, createBloodRequest } from '../appwrite'

export default function Packages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingModal, setBookingModal] = useState(null)
  const ref = useRef()

  useEffect(() => { loadPackages() }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    ref.current?.querySelectorAll('.fade-in').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [packages])

  const loadPackages = async () => {
    try {
      const res = await getPackages()
      setPackages(res.documents)
    } catch (err) { console.error('Failed to load packages:', err) }
    setLoading(false)
  }

  return (
    <section id="packages" ref={ref} className="section">
      <div className="container">
        <div className="fade-in">
          <div className="gold-line" />
          <h2 className="section-title">Diagnostic Packages</h2>
          <p className="section-subtitle">Comprehensive health checkup packages tailored for your needs.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
            Loading packages...
          </div>
        ) : packages.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            border: '1px dashed rgba(14,116,144,0.3)', borderRadius: 16, color: 'var(--gray-400)',
          }}>
            <FaFlask style={{ fontSize: '2.5rem', marginBottom: 16, opacity: 0.4 }} />
            <p>No packages available yet. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
            {packages.map((pkg, i) => (
              <PackageCard key={pkg.$id} pkg={pkg} delay={i * 0.1} onBook={() => setBookingModal(pkg)} />
            ))}
          </div>
        )}
      </div>

      {bookingModal && (
        <BookingModal pkg={bookingModal} onClose={() => setBookingModal(null)} />
      )}
    </section>
  )
}

function PackageCard({ pkg, delay, onBook }) {
  const features = pkg.features
    ? (typeof pkg.features === 'string' ? pkg.features.split('\n').filter(Boolean) : pkg.features)
    : []

  return (
    <div className="card fade-in" style={{ animationDelay: `${delay}s`, display: 'flex', flexDirection: 'column' }}>
      {pkg.imageId ? (
        <div style={{ height: 180, borderRadius: 8, overflow: 'hidden', marginBottom: 20, background: 'rgba(10,22,40,0.6)' }}>
          <img
            src={getImagePreviewUrl(pkg.imageId)}
            alt={pkg.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onLoad={() => console.log('IMG OK:', getImagePreviewUrl(pkg.imageId))}
            onError={(e) => {
              console.error('IMG FAILED:', getImagePreviewUrl(pkg.imageId))
              e.target.style.display = 'none'
              e.target.parentNode.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#6b7280;font-size:0.8rem;padding:8px;text-align:center">Image failed to load.<br/>Check console for URL.</div>'
            }}
          />
        </div>
      ) : (
        <div style={{ height: 140, borderRadius: 8, background: 'linear-gradient(135deg, rgba(14,116,144,0.2), rgba(201,168,76,0.1))', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🧪</div>
      )}

      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', marginBottom: 8, color: 'var(--white)' }}>{pkg.title}</h3>

      {pkg.price && (
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold-light)', fontWeight: 700 }}>₹{pkg.price}</span>
          <span style={{ color: 'var(--gray-600)', fontSize: '0.8rem', marginLeft: 4 }}>/ package</span>
        </div>
      )}

      <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{pkg.description}</p>

      {features.length > 0 && (
        <ul style={{ listStyle: 'none', marginBottom: 20 }}>
          {features.slice(0, 5).map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6, fontSize: '0.85rem', color: 'var(--gray-400)' }}>
              <FaCheckCircle style={{ color: 'var(--teal-light)', marginTop: 2, flexShrink: 0 }} />
              {f}
            </li>
          ))}
        </ul>
      )}

      <button className="btn btn-primary" onClick={onBook} style={{ width: '100%', justifyContent: 'center' }}>
        <FaFlask /> Book This Package
      </button>
    </div>
  )
}

function BookingModal({ pkg, onClose }) {
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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
      await createBloodRequest({ ...form, package: pkg.title })
      setSuccess(true)
      setTimeout(() => onClose(), 3000)
    } catch (err) {
      setError('Failed to submit. Please try again.')
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>Book: {pkg.title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', fontSize: '1.2rem', cursor: 'pointer' }}><FaTimes /></button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 8 }}>Booking Submitted!</h4>
            <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              We'll review your request and contact you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" placeholder="Enter your full name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Address *</label>
              <textarea rows={2} placeholder="Your complete address" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })} style={{ resize: 'none' }} />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Email Address</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--teal-light)', fontWeight: 400 }}>
                  📧 Get confirmation when accepted
                </span>
              </label>
              <input type="email" placeholder="yourname@gmail.com (optional)" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            {error && <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}

            <button type="submit" className="btn btn-gold" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
              {loading ? 'Submitting...' : 'Confirm Booking'}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', textAlign: 'center', marginTop: 10 }}>
              🔒 No login required. Your data is private and secure.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}