import { FaFacebook, FaInstagram, FaHeart } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer style={{
      position: 'relative', zIndex: 1,
      borderTop: '1px solid rgba(14,116,144,0.2)',
      background: 'rgba(10,22,40,0.6)',
      backdropFilter: 'blur(12px)',
      padding: '48px 24px 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>
              RAJ INSTITUTE OF MEDICAL SCIENCES
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 16 }}>
              Dedicated to excellence in medical education and healthcare diagnostics.
              Affiliated with UGC Approved Universities, GSDM and NSDM.
            </p>
            {/* Social Icons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <SocialBtn icon={<FaFacebook />} href="https://facebook.com" label="Facebook" />
              <SocialBtn icon={<FaInstagram />} href="https://instagram.com" label="Instagram" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: 16 }}>Quick Links</h4>
            {['Blood Test', 'Packages', 'Courses', 'Gallery', 'Feedback', 'Contact'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`} style={{
                display: 'block', color: 'var(--gray-400)', textDecoration: 'none',
                fontSize: '0.88rem', marginBottom: 8, transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--teal-light)'}
              onMouseLeave={e => e.target.style.color = 'var(--gray-400)'}
              >{l}</a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: 16 }}>Contact</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginBottom: 8 }}>pankajosank1994@gmail.com</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginBottom: 8 }}>Raj Vakhalaya, Station Road, Kundwa, East Champaran, Bihar</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Pin Code: 845304</p>
          </div>

          {/* Founder */}
          <div>
            <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: 16 }}>Founder</h4>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--white)', marginBottom: 4 }}>DR. PANKAJ KUMAR</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.6 }}>
              Director & Founder,<br />
              Raj Institute of Medical Sciences,<br />
              Kundwa Chainpur, Bihar
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(14,116,144,0.15)',
          paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
            © {new Date().getFullYear()} Raj Institute of Medical Sciences. All rights reserved.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Developed with <FaHeart style={{ color: '#ef4444', fontSize: '0.8rem' }} /> by{' '}
            <strong style={{ color: 'var(--teal-light)' }}>DKS</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}

function SocialBtn({ icon, href, label }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{
      width: 38, height: 38, borderRadius: 8,
      background: 'rgba(14,116,144,0.15)',
      border: '1px solid rgba(14,116,144,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--teal-light)', fontSize: '1rem', textDecoration: 'none',
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,116,144,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(14,116,144,0.15)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {icon}
    </a>
  )
}
