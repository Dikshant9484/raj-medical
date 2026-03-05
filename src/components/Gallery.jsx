import { useEffect, useRef } from 'react'

// Using placeholder medical images from Unsplash
const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80', caption: 'Modern Laboratory' },
  { url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&q=80', caption: 'Medical Consultation' },
  { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80', caption: 'Diagnostic Equipment' },
  { url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80', caption: 'Blood Analysis' },
  { url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80', caption: 'Research Lab' },
  { url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80', caption: 'Patient Care' },
  { url: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80', caption: 'Medical Training' },
  { url: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&q=80', caption: 'Healthcare Facility' },
  { url: 'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=600&q=80', caption: 'Advanced Testing' },
]

export default function Gallery() {
  const row1Ref = useRef()
  const row2Ref = useRef()
  const ref = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    ref.current?.querySelectorAll('.fade-in').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const row1 = galleryImages.slice(0, 5)
  const row2 = galleryImages.slice(4)

  return (
    <section id="gallery" ref={ref} className="section">
      <div className="container">
        <div className="fade-in">
          <div className="gold-line" />
          <h2 className="section-title">Gallery</h2>
          <p className="section-subtitle">A glimpse into our state-of-the-art facilities and campus life.</p>
        </div>
      </div>

      {/* Infinite scroll rows */}
      <div style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div ref={row1Ref} style={{
          display: 'flex', gap: 16,
          animation: 'scrollLeft 28s linear infinite',
          width: 'max-content',
        }}>
          {[...row1, ...row1].map((img, i) => (
            <GalleryItem key={i} img={img} />
          ))}
        </div>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div ref={row2Ref} style={{
          display: 'flex', gap: 16,
          animation: 'scrollRight 32s linear infinite',
          width: 'max-content',
        }}>
          {[...row2, ...row2].map((img, i) => (
            <GalleryItem key={i} img={img} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .gallery-item:hover {
          transform: scale(1.04);
          border-color: rgba(14,116,144,0.6) !important;
        }
        .gallery-item:hover .gallery-caption {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  )
}

function GalleryItem({ img }) {
  return (
    <div className="gallery-item" style={{
      width: 280, height: 200, borderRadius: 12, overflow: 'hidden',
      flexShrink: 0, position: 'relative', cursor: 'pointer',
      border: '1px solid rgba(14,116,144,0.2)',
      transition: 'transform 0.3s ease, border-color 0.3s ease',
    }}>
      <img
        src={img.url}
        alt={img.caption}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        loading="lazy"
      />
      <div className="gallery-caption" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(10,22,40,0.9))',
        padding: '24px 16px 12px',
        opacity: 0, transition: 'opacity 0.3s ease',
      }}>
        <p style={{ color: 'var(--white)', fontSize: '0.85rem', fontWeight: 500 }}>{img.caption}</p>
      </div>
    </div>
  )
}
