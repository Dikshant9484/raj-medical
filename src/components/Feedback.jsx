import { useState, useEffect, useRef } from 'react'
import { FaStar } from 'react-icons/fa'
import { createFeedback, getFeedback } from '../appwrite'

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([])
  const [form, setForm] = useState({ name: '', message: '', rating: 5 })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef()

  useEffect(() => {
    loadFeedbacks()
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    ref.current?.querySelectorAll('.fade-in').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [feedbacks])

  const loadFeedbacks = async () => {
    try {
      const res = await getFeedback()
      setFeedbacks(res.documents)
    } catch (err) {
      console.error('Failed to load feedback:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.message) {
      setError('Please fill in all fields.'); return
    }
    setLoading(true)
    try {
      await createFeedback(form)
      setSuccess(true)
      setForm({ name: '', message: '', rating: 5 })
      await loadFeedbacks()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to submit feedback. Please try again.')
    }
    setLoading(false)
  }

  return (
    <section id="feedback" ref={ref} className="section" style={{
      background: 'rgba(10,22,40,0.3)',
      borderTop: '1px solid rgba(14,116,144,0.1)',
    }}>
      <div className="container">
        <div className="fade-in">
          <div className="gold-line" />
          <h2 className="section-title">Feedback & Reviews</h2>
          <p className="section-subtitle">We value your experience. Share your thoughts with us.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }} className="feedback-grid">
          {/* Submit form */}
          <div className="fade-in card" style={{ padding: 32 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 24 }}>Leave a Review</h3>

            {success && (
              <div style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 8, padding: '12px 16px', marginBottom: 20,
                color: '#6ee7b7', fontSize: '0.9rem',
              }}>
                ✅ Thank you for your feedback!
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" placeholder="Enter your name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              {/* Star Rating */}
              <div className="form-group">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.6rem',
                        color: star <= form.rating ? 'var(--gold)' : 'var(--gray-600)',
                        transition: 'transform 0.1s, color 0.2s',
                        transform: star <= form.rating ? 'scale(1.15)' : 'scale(1)',
                      }}>
                      <FaStar />
                    </button>
                  ))}
                  <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem', alignSelf: 'center', marginLeft: 4 }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea placeholder="Share your experience..." rows={4} value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })} style={{ resize: 'none' }} />
              </div>

              {error && <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>

          {/* Reviews display */}
          <div>
            {feedbacks.length === 0 ? (
              <div className="fade-in" style={{
                textAlign: 'center', padding: '48px 24px',
                border: '1px dashed rgba(14,116,144,0.3)', borderRadius: 16,
                color: 'var(--gray-400)',
              }}>
                <FaStar style={{ fontSize: '2rem', opacity: 0.3, marginBottom: 12 }} />
                <p>No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 520, overflowY: 'auto', paddingRight: 8 }}>
                {feedbacks.map((fb, i) => (
                  <div key={fb.$id} className="card fade-in" style={{ padding: 20, animationDelay: `${i * 0.08}s` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--teal), #0891b2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white',
                        }}>
                          {fb.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--white)' }}>{fb.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                            {new Date(fb.$createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="stars">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <FaStar key={si} style={{ color: si < fb.rating ? 'var(--gold)' : 'var(--gray-600)', fontSize: '0.85rem' }} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem', lineHeight: 1.6 }}>{fb.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .feedback-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
