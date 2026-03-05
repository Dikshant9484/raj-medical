import { useEffect, useRef } from 'react'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserMd, FaClinicMedical } from 'react-icons/fa'

export default function Contact() {
  const ref = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    ref.current?.querySelectorAll('.fade-in').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="contact" ref={ref} className="section">
      <div className="container">
        <div className="fade-in">
          <div className="gold-line" />
          <h2 className="section-title">Contact Us</h2>
          <p className="section-subtitle">Get in touch for admissions, appointments, or any queries.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }} className="contact-grid">
          {/* Left — contact cards */}
          <div className="fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <ContactCard
                icon={<FaPhone style={{ fontSize: '1.1rem', color: 'var(--teal-light)' }} />}
                label="Phone / Mobile"
                href="tel:+917488537035"
                value="+91 74885 37035"
              />
              <ContactCard
                icon={<FaEnvelope style={{ fontSize: '1.1rem', color: 'var(--teal-light)' }} />}
                label="Email"
                href="mailto:pankajosank1994@gmail.com"
                value="pankajosank1994@gmail.com"
              />
              <ContactCard
                icon={<FaMapMarkerAlt style={{ fontSize: '1.1rem', color: 'var(--teal-light)' }} />}
                label="Address"
                href="https://maps.google.com/?q=Kundwa+Chainpur+East+Champaran+Bihar+845304"
                value={
                  <>
                    Raj Vakhalaya, Station Road, Kundwa,<br />
                    Chelpur Landmark Post Office,<br />
                    Railway Station — East Champaran, Bihar 845304
                  </>
                }
              />
              <ContactCard
                icon={<FaClinicMedical style={{ fontSize: '1.1rem', color: 'var(--teal-light)' }} />}
                label="Clinic Registration"
                href="#"
                value="Xpress Cure E-Clinic (Reg. xc4049543)"
              />
            </div>

            {/* Founder Card */}
            <div className="card fade-in" style={{
              marginTop: 24, padding: '22px 28px',
              borderColor: 'rgba(201,168,76,0.3)',
              background: 'rgba(201,168,76,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FaUserMd style={{ fontSize: '1.3rem', color: 'var(--navy)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Founder &amp; Director</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold-light)', fontWeight: 700 }}>DR. PANKAJ KUMAR</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 2 }}>Xpress Cure E-Clinic &amp; RIMS, East Champaran</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — hours + map */}
          <div className="fade-in">
            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 20 }}>Working Hours</h3>
              {[
                { day: 'Monday – Saturday', time: '8:00 AM – 8:00 PM' },
                { day: 'Sunday', time: '9:00 AM – 2:00 PM' },
                { day: 'Blood & Urine Checkup', time: 'Available Daily' },
                { day: 'Emergency / E-Clinic', time: 'Available 24/7' },
              ].map(h => (
                <div key={h.day} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid rgba(14,116,144,0.1)',
                }}>
                  <span style={{ fontSize: '0.86rem', color: 'var(--gray-400)' }}>{h.day}</span>
                  <span style={{
                    fontSize: '0.86rem', fontWeight: 500,
                    color: h.day.includes('Emergency') || h.day.includes('E-Clinic') ? 'var(--teal-light)' : 'var(--white)',
                  }}>{h.time}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 16 }}>Location</h3>
              <div style={{
                borderRadius: 10, overflow: 'hidden', height: 180,
                background: 'rgba(14,116,144,0.1)', border: '1px solid rgba(14,116,144,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 8,
              }}>
                <FaMapMarkerAlt style={{ fontSize: '2.2rem', color: 'var(--teal-light)', opacity: 0.65 }} />
                <p style={{ color: 'var(--gray-400)', fontSize: '0.83rem', textAlign: 'center', lineHeight: 1.6 }}>
                  Raj Vakhalaya, Station Road, Kundwa<br />
                  Chelpur, East Champaran<br />
                  Bihar — 845304
                </p>
                <a href="https://maps.google.com/?q=Kundwa+East+Champaran+Bihar+845304" target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline" style={{ padding: '6px 18px', fontSize: '0.8rem', marginTop: 4 }}>
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}

function ContactCard({ icon, label, href, value }) {
  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: 'rgba(14,116,144,0.15)', border: '1px solid rgba(14,116,144,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
          <div style={{ color: 'var(--white)', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.5 }}>{value}</div>
        </div>
      </div>
    </a>
  )
}
