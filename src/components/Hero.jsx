import { useEffect, useRef } from 'react'
import { FaHeartbeat, FaUserMd, FaFlask } from 'react-icons/fa'

export default function Hero() {
  const ref = useRef()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) {
        ref.current.querySelectorAll('.fade-in').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 180)
        })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section ref={ref} style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '120px 24px 80px', position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* Partner badge */}
        <div className="fade-in" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(14,116,144,0.1)', border: '1px solid rgba(14,116,144,0.3)',
          borderRadius: 40, padding: '8px 20px', marginBottom: 32,
        }}>
          <FaHeartbeat style={{ color: 'var(--teal-light)', fontSize: '0.85rem' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', letterSpacing: '0.08em' }}>
            PARTNERED WITH GENERAL DIAGNOSTICS INTERNATIONAL PVT. LTD
          </span>
        </div>

        {/* Main heading */}
        <h1 className="fade-in" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.4rem, 6vw, 5rem)',
          fontWeight: 700, lineHeight: 1.05,
          color: 'var(--white)', marginBottom: 24,
          letterSpacing: '-0.01em',
        }}>
          RAJ INSTITUTE OF<br />
          <span style={{ color: 'var(--teal-light)' }}>MEDICAL SCIENCES</span>
        </h1>

        {/* Affiliation */}
        <div className="fade-in" style={{ marginBottom: 40 }}>
          <p style={{ fontSize: '0.92rem', color: 'var(--gray-400)', marginBottom: 6 }}>
            <span style={{ color: 'var(--gold-light)' }}>मैंडिकाल क्षेत्र में अपना सपना साकार करें</span> <span style={{ color: 'var(--gold-light)' }}>Affiliated with</span> UGC Approved Universities, GSDM and NSDMnbsp;·<span style={{ color: 'var(--gold-light)' }}>Affiliated with</span> UGC Approved Universities, GSDM and NSDMnbsp; Affiliated with UGC Approved Universities, GSDM and NSDM
          </p>
          <p style={{ fontSize: '0.88rem', color: 'var(--gray-600)' }}>
            Founded by <strong style={{ color: 'var(--white)' }}>DR. PANKAJ KUMAR</strong> &nbsp;·&nbsp; 
            Station Road, Kundwa, East Champaran, Bihar — 845304
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="fade-in" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 64 }}>
          <a href="#blood-test" className="btn btn-gold" style={{ fontSize: '0.95rem' }}>
            <FaFlask /> Book Blood Test
          </a>
          <a href="#courses" className="btn btn-outline" style={{ fontSize: '0.95rem' }}>
            <FaUserMd /> Explore Courses
          </a>
        </div>

        {/* Stats row */}
        <div className="fade-in" style={{
          display: 'flex', gap: 40, flexWrap: 'wrap',
        }}>
          {[
            { val: 'UGC', label: 'Approved' },
            { val: '20+', label: 'Courses' },
            { val: 'ISO', label: 'Certified Lab' },
            { val: '24/7', label: 'Support' },
          ].map(s => (
            <div key={s.val} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '2rem',
                fontWeight: 700, color: 'var(--teal-light)',
              }}>{s.val}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Decorative line */}
        <div style={{
          position: 'absolute', right: '5%', top: '30%',
          width: 1, height: '40%',
          background: 'linear-gradient(to bottom, transparent, rgba(14,116,144,0.4), transparent)',
          display: 'none',
        }} className="deco-line" />
      </div>

      {/* Floating medical icons */}
      <FloatingIcon icon="🩺" top="20%" right="8%" delay="0s" />
      <FloatingIcon icon="🔬" top="60%" right="15%" delay="1.5s" />
      <FloatingIcon icon="💊" top="40%" right="3%" delay="3s" />
    </section>
  )
}

function FloatingIcon({ icon, top, right, left, delay }) {
  return (
    <div style={{
      position: 'absolute', top, right, left,
      fontSize: '2.2rem', opacity: 0.12,
      animation: `float 6s ease-in-out ${delay} infinite`,
      zIndex: 0,
    }}>
      {icon}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @media (max-width: 768px) { .deco-line { display: none !important; } }
      `}</style>
    </div>
  )
}
