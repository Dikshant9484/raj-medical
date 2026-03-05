import { useEffect, useRef } from 'react'
import { FaStethoscope, FaLaptopCode, FaUniversity, FaGraduationCap } from 'react-icons/fa'

export default function Courses() {
  const ref = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.08 })
    ref.current?.querySelectorAll('.fade-in').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="courses" ref={ref} className="section" style={{
      background: 'rgba(10,22,40,0.35)',
      borderTop: '1px solid rgba(14,116,144,0.12)',
      borderBottom: '1px solid rgba(14,116,144,0.12)',
    }}>
      <div className="container">
        <div className="fade-in">
          <div className="gold-line" />
          <h2 className="section-title">Our Courses</h2>
          <p className="section-subtitle">
            College for Computer, Paramedical, Nursing &amp; Pharmacy — affiliated with UGC Approved Universities, GSDM and NSDM.
          </p>
        </div>

        {/* Paramedical — 12th Stream */}
        <div className="fade-in" style={blockStyle('rgba(14,116,144,0.12)', 'rgba(14,116,144,0.32)')}>
          <BlockHeader icon={<FaStethoscope style={{ color: 'var(--teal-light)', fontSize: '1.6rem' }} />} title="Paramedical Courses" badge="Eligibility: 12th (Any Stream)" badgeColor="rgba(14,116,144,0.25)" badgeText="var(--teal-light)" />
          <div style={gridStyle}>
            {[
              'Medical Lab Technology',
              'Optometry Technician',
              'Operation Theatre',
              'Cardiac Care Technology',
              'Physiotherapy',
              'Dialysis Technician',
              'Radiology and Imaging Technology',
              'E.M.T. (Emergency Medical Technician)',
              'BNYS — Bachelor of Naturopathy & Yogic Sciences (PCB)',
            ].map(c => <CourseItem key={c} name={c} icon="⚕️" />)}
          </div>
        </div>

        {/* Certificate / Short Courses — 10th */}
        <div className="fade-in" style={blockStyle('rgba(201,168,76,0.07)', 'rgba(201,168,76,0.28)')}>
          <BlockHeader icon={<span style={{ fontSize: '1.5rem' }}>📋</span>} title="Certificate Courses" badge="Eligibility: 10th (Minimum)" badgeColor="rgba(201,168,76,0.18)" badgeText="var(--gold-light)" />
          <div style={gridStyle}>
            {[
              'Dresser (Medical)',
              'CMS & ED — Community Medical Services & Essential Drugs',
            ].map(c => <CourseItem key={c} name={c} icon="🩺" accent="var(--gold-light)" />)}
          </div>
        </div>

        {/* Computer Courses */}
        <div className="fade-in" style={blockStyle('rgba(99,102,241,0.08)', 'rgba(99,102,241,0.3)')}>
          <BlockHeader icon={<FaLaptopCode style={{ color: '#a78bfa', fontSize: '1.6rem' }} />} title="Computer Courses" badge="All Eligibility Levels" badgeColor="rgba(99,102,241,0.2)" badgeText="#a78bfa" />
          <div style={gridStyle}>
            {[
              'DCA — Diploma in Computer Applications',
              'ADCA — Advanced Diploma in Computer Applications',
              'PGDCA — Post Graduate Diploma in Computer Applications',
              'TALLY — Accounting & GST Software',
              'TYPING — Hindi / English',
            ].map(c => <CourseItem key={c} name={c} icon="💻" accent="#a78bfa" />)}
          </div>
        </div>

        {/* UG & PG Programs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="ug-pg-grid">
          {/* UG */}
          <div className="fade-in" style={blockStyle('rgba(16,185,129,0.07)', 'rgba(16,185,129,0.28)')}>
            <BlockHeader icon={<FaGraduationCap style={{ color: '#6ee7b7', fontSize: '1.5rem' }} />} title="UG Programs" badge="Undergraduate" badgeColor="rgba(16,185,129,0.15)" badgeText="#6ee7b7" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { code: 'B.A.', full: 'Bachelor of Arts' },
                { code: 'B.COM', full: 'Bachelor of Commerce' },
                { code: 'B.SC', full: 'Bachelor of Science' },
              ].map(c => (
                <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#6ee7b7', fontSize: '1rem', minWidth: 70 }}>{c.code}</span>
                  <span style={{ color: 'var(--gray-400)', fontSize: '0.88rem' }}>{c.full}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PG */}
          <div className="fade-in" style={blockStyle('rgba(239,68,68,0.06)', 'rgba(239,68,68,0.25)')}>
            <BlockHeader icon={<FaUniversity style={{ color: '#fca5a5', fontSize: '1.5rem' }} />} title="PG Programs" badge="Postgraduate" badgeColor="rgba(239,68,68,0.15)" badgeText="#fca5a5" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { code: 'M.SC', full: 'Master of Science' },
                { code: 'MCA', full: 'Master of Computer Applications' },
                { code: 'MBA', full: 'Master of Business Administration' },
                { code: 'M.LIB', full: 'Master of Library Science' },
                { code: 'MSW', full: 'Master of Social Work' },
              ].map(c => (
                <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fca5a5', fontSize: '1rem', minWidth: 70 }}>{c.code}</span>
                  <span style={{ color: 'var(--gray-400)', fontSize: '0.88rem' }}>{c.full}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="fade-in" style={{
          marginTop: 32, textAlign: 'center', padding: '22px 28px',
          border: '1px solid rgba(201,168,76,0.22)', borderRadius: 12,
          background: 'rgba(201,168,76,0.05)',
        }}>
          <p style={{ color: 'var(--gold-light)', fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>
            यहाँ Full Body Checkup — Blood &amp; Urine द्वारा होता हैं।
          </p>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>
            All programs affiliated with <strong style={{ color: 'var(--white)' }}>UGC Approved Universities</strong>, <strong style={{ color: 'var(--white)' }}>GSDM</strong> and <strong style={{ color: 'var(--white)' }}>NSDM</strong> &nbsp;·&nbsp; Contact for admission details and fee structure.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ug-pg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

const blockStyle = (bg, border) => ({
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: 16,
  padding: '28px 32px',
  marginBottom: 24,
  backdropFilter: 'blur(8px)',
})

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: '10px 24px',
}

function BlockHeader({ icon, title, badge, badgeColor, badgeText }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
      {icon}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--white)' }}>{title}</h3>
      <span style={{
        padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        background: badgeColor, color: badgeText, border: `1px solid ${badgeText}33`,
      }}>{badge}</span>
    </div>
  )
}

function CourseItem({ name, icon, accent = 'var(--teal-light)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: 6, display: 'block' }} />
      <span style={{ color: 'var(--gray-300)', fontSize: '0.9rem', lineHeight: 1.45,
        '--gray-300': '#cbd5e1' }}>{name}</span>
    </div>
  )
}
