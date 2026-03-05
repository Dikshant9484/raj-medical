import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'

const links = [
  { label: 'Blood Test',  href: '#blood-test'  },
  { label: 'Certificate', href: '#certificate' },
  { label: 'Packages',    href: '#packages'    },
  { label: 'Courses',     href: '#courses'     },
  { label: 'Admission',   href: '#admission'   },
  { label: 'Gallery',     href: '#gallery'     },
  { label: 'Feedback',    href: '#feedback'    },
  { label: 'Contact',     href: '#contact'     },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(10,22,40,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(14,116,144,0.2)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <a href="#" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0e7490, #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 700, color: 'white',
              fontFamily: 'var(--font-display)', flexShrink: 0,
            }}>R</div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--white)', letterSpacing: '0.02em', lineHeight: 1.2,
              display: 'block', maxWidth: 160,
            }}>
              RAJ INSTITUTE<br/>
              <span style={{ color: 'var(--teal-light)', fontSize: '0.7rem', fontWeight: 400 }}>OF MEDICAL SCIENCES</span>
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <ul style={{ display: 'flex', gap: 32, listStyle: 'none', alignItems: 'center' }} className="desktop-nav">
          {links.map(l => (
            <li key={l.label}>
              <a href={l.href} style={{
                color: 'var(--gray-400)', textDecoration: 'none',
                fontSize: '0.88rem', fontWeight: 500, letterSpacing: '0.03em',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--teal-light)'}
              onMouseLeave={e => e.target.style.color = 'var(--gray-400)'}
              >{l.label}</a>
            </li>
          ))}
          <li>
            <Link to="/admin" style={{
              padding: '8px 20px', borderRadius: 8,
              background: 'rgba(14,116,144,0.15)', border: '1px solid rgba(14,116,144,0.4)',
              color: 'var(--teal-light)', fontSize: '0.85rem', fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.2s',
            }}>Admin</Link>
          </li>
        </ul>

        {/* Mobile Burger */}
        <button
          onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.3rem', cursor: 'pointer', display: 'none' }}
          className="burger-btn"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={{
          background: 'rgba(10,22,40,0.97)', borderTop: '1px solid rgba(14,116,144,0.2)',
          padding: '24px',
        }}>
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{
              display: 'block', padding: '12px 0',
              color: 'var(--gray-400)', textDecoration: 'none', fontSize: '0.95rem',
              borderBottom: '1px solid rgba(14,116,144,0.1)',
            }}>{l.label}</a>
          ))}
          <Link to="/admin" onClick={() => setOpen(false)} style={{ display: 'block', marginTop: 16, color: 'var(--teal-light)', textDecoration: 'none' }}>Admin Panel</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .burger-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
