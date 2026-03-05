import CertificatesTab from './CertificatesTab'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFlask, FaBox, FaComments, FaSignOutAlt, FaPlus, FaTrash, FaCheck, FaTimes, FaUpload, FaCertificate, FaEnvelope, FaGraduationCap, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa'
import emailjs from 'emailjs-com'
import {
  getAdminSession, adminLogout,
  getBloodRequests, updateBloodRequestStatus, deleteBloodRequest,
  getPackages, createPackage, deletePackage, uploadPackageImage, getImagePreviewUrl,
  getFeedback, deleteFeedback,
  getAllAdmissions, updateAdmissionStatus, deleteAdmissionDoc,
} from '../appwrite'

const TABS = [
  { id: 'blood',        label: 'Blood Requests', icon: <FaFlask />        },
  { id: 'admissions',   label: 'Admissions',     icon: <FaGraduationCap />},
  { id: 'packages',     label: 'Packages',        icon: <FaBox />          },
  { id: 'feedback',     label: 'Feedback',         icon: <FaComments />    },
  { id: 'certificates', label: 'Certificates',     icon: <FaCertificate /> },
]

const ADMIN_EMAIL = 'pankajosank1994@gmail.com'

// ─── Root Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [user, setUser]       = useState(null)
  const [tab, setTab]         = useState('blood')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getAdminSession().then(u => {
      if (!u) { navigate('/admin'); return }
      setUser(u)
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    await adminLogout()
    navigate('/admin')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-light)' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Bar ── */}
      <header style={{
        background: 'rgba(15,32,68,0.95)', borderBottom: '1px solid rgba(14,116,144,0.2)',
        padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--teal), #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
          }}>⚕</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--white)' }}>Admin Dashboard</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)' }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ fontSize: '0.82rem', color: 'var(--gray-400)', textDecoration: 'none' }}>View Site</a>
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: 220, background: 'rgba(10,22,40,0.6)', borderRight: '1px solid rgba(14,116,144,0.15)',
          padding: '24px 16px', flexShrink: 0,
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background:   tab === t.id ? 'rgba(14,116,144,0.2)' : 'transparent',
              color:        tab === t.id ? 'var(--teal-light)'     : 'var(--gray-400)',
              fontFamily: 'var(--font-body)', fontSize: '0.9rem',
              fontWeight:   tab === t.id ? 600 : 400,
              marginBottom: 4, transition: 'all 0.2s',
              borderLeft:   tab === t.id ? '3px solid var(--teal)' : '3px solid transparent',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </aside>

        {/* ── Main Content ── */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {tab === 'blood'        && <BloodTab />}
          {tab === 'admissions'   && <AdmissionsTab />}
          {tab === 'packages'     && <PackagesTab />}
          {tab === 'feedback'     && <FeedbackTab />}
          {tab === 'certificates' && <CertificatesTab />}
        </main>
      </div>
    </div>
  )
}

// ─── Blood Requests Tab ───────────────────────────────────────────────────────

function BloodTab() {
  const [requests, setRequests]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState('all')
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast]                 = useState(null) // { type: 'success'|'error'|'info', msg }

  useEffect(() => { load() }, [])

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 5000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const res = await getBloodRequests()
      setRequests(res.documents)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  // ── Send email via EmailJS ──────────────────────────────────────────────────
  const sendEmail = async (toEmail, templateParams) => {
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { to_email: toEmail, ...templateParams },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      return true
    } catch (err) {
      console.warn(`Email to ${toEmail} failed:`, err)
      return false
    }
  }

  // ── Accept / Reject ─────────────────────────────────────────────────────────
  const handleAction = async (id, status, request) => {
    setActionLoading(id)
    try {
      // 1. Update status in Appwrite
      await updateBloodRequestStatus(id, status)

      const isAccepted   = status === 'accepted'
      const statusLabel  = isAccepted ? 'ACCEPTED ✅' : 'REJECTED ❌'
      const packageInfo  = request.package ? ` (Package: ${request.package})` : ''

      // ── 2. Email to ADMIN ────────────────────────────────────────────────────
      await sendEmail(ADMIN_EMAIL, {
        subject:         `Blood Test Request ${statusLabel} — ${request.name}`,
        patient_name:    request.name,
        patient_phone:   request.phone,
        patient_address: request.address,
        patient_email:   request.email || 'Not provided',
        status:          statusLabel,
        package_info:    packageInfo,
        message:         `Blood test request from ${request.name} (${request.phone})${packageInfo} has been ${status.toUpperCase()}.`,
        institute_name:  'Raj Institute of Medical Sciences',
        contact_number:  '+91 74885 37035',
      })

      // ── 3. Email to CUSTOMER (only if they provided email) ───────────────────
      let emailSent = false
      if (request.email) {
        emailSent = await sendEmail(request.email, {
          subject:         `Your Blood Test Appointment — ${statusLabel}`,
          patient_name:    request.name,
          patient_phone:   request.phone,
          patient_address: request.address,
          patient_email:   request.email,
          status:          statusLabel,
          package_info:    packageInfo,
          institute_name:  'Raj Institute of Medical Sciences',
          contact_number:  '+91 74885 37035',
          message: isAccepted
            ? `Dear ${request.name}, your blood test appointment at Raj Institute of Medical Sciences has been CONFIRMED! Our team will contact you at ${request.phone} to finalize your slot. If you have any questions, call us at +91 74885 37035. — Dr. Pankaj Kumar, RIMS`
            : `Dear ${request.name}, we regret that your blood test request at Raj Institute of Medical Sciences could not be confirmed at this time. Please call us at +91 74885 37035 to reschedule or inquire further. — Dr. Pankaj Kumar, RIMS`,
        })
      }

      // ── 4. Toast feedback ────────────────────────────────────────────────────
      if (request.email) {
        showToast(
          emailSent ? 'success' : 'error',
          emailSent
            ? `✅ Request ${status} — confirmation email sent to ${request.email}`
            : `⚠️ Status updated but email to ${request.email} failed. Please notify manually.`
        )
      } else {
        showToast('success', `✅ Request marked as ${status}. (Customer did not provide email)`)
      }

      await load()
    } catch (err) {
      console.error(err)
      showToast('error', 'Action failed: ' + err.message)
    }
    setActionLoading(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this request?')) return
    try { await deleteBloodRequest(id); await load() } catch (err) { console.error(err) }
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 9999,
          padding: '14px 20px', borderRadius: 12, maxWidth: 420,
          background:
            toast.type === 'success' ? 'rgba(16,185,129,0.15)' :
            toast.type === 'error'   ? 'rgba(239,68,68,0.15)'  :
                                       'rgba(14,116,144,0.15)',
          border: `1px solid ${
            toast.type === 'success' ? 'rgba(16,185,129,0.4)' :
            toast.type === 'error'   ? 'rgba(239,68,68,0.4)'  :
                                       'rgba(14,116,144,0.4)'}`,
          color:
            toast.type === 'success' ? '#6ee7b7' :
            toast.type === 'error'   ? '#fca5a5' :
                                       'var(--teal-light)',
          fontSize: '0.88rem', lineHeight: 1.55, fontWeight: 500,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          animation: 'slideUp 0.3s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 4 }}>Blood Test Requests</h2>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>
            📧 Accepting or rejecting a request automatically sends a confirmation email to the customer (if they provided one).
          </p>
        </div>
        <button onClick={load} className="btn btn-outline" style={{ padding: '7px 16px', fontSize: '0.82rem', flexShrink: 0 }}>
          ↻ Refresh
        </button>
      </div>

      {/* ── Filter Pills ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'pending', 'accepted', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.82rem',
            background: filter === f ? 'var(--teal)' : 'rgba(14,116,144,0.1)',
            color:      filter === f ? 'white'       : 'var(--gray-400)',
            fontFamily: 'var(--font-body)',
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {/* ── Request Cards ── */}
      {loading ? <Loader /> : filtered.length === 0 ? <Empty label="No requests found." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(req => (
            <div key={req.$id} style={{
              background: 'rgba(15,32,68,0.7)', border: '1px solid rgba(14,116,144,0.2)',
              borderRadius: 12, padding: '20px 24px',
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
              opacity: actionLoading === req.$id ? 0.65 : 1,
              transition: 'opacity 0.2s',
            }}>
              {/* Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--white)' }}>
                    {req.name}
                  </h3>
                  <span className={`badge badge-${req.status}`}>{req.status}</span>

                  {/* Email sent badge */}
                  {req.status === 'accepted' && req.email && (
                    <span style={{
                      fontSize: '0.7rem', padding: '2px 9px', borderRadius: 12,
                      background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                      color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 4,
                    }}><FaEnvelope style={{ fontSize: '0.65rem' }} /> Email Sent</span>
                  )}
                  {req.status === 'rejected' && req.email && (
                    <span style={{
                      fontSize: '0.7rem', padding: '2px 9px', borderRadius: 12,
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                      color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 4,
                    }}><FaEnvelope style={{ fontSize: '0.65rem' }} /> Email Sent</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.83rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    📞 <strong style={{ color: 'var(--white)' }}>{req.phone}</strong>
                  </span>
                  {req.email && (
                    <span style={{ fontSize: '0.83rem', color: 'var(--teal-light)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FaEnvelope style={{ fontSize: '0.75rem' }} /> {req.email}
                    </span>
                  )}
                  {!req.email && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontStyle: 'italic' }}>
                      No email provided
                    </span>
                  )}
                  <span style={{ fontSize: '0.83rem', color: 'var(--gray-400)' }}>📍 {req.address}</span>
                  {req.package && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--gold-light)' }}>📦 {req.package}</span>
                  )}
                  <span style={{ fontSize: '0.76rem', color: 'var(--gray-600)' }}>
                    🕐 {new Date(req.$createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {req.status === 'pending' && (<>
                  <button
                    className="btn btn-success"
                    style={{ padding: '7px 14px', fontSize: '0.8rem', minWidth: 100 }}
                    disabled={actionLoading === req.$id}
                    onClick={() => handleAction(req.$id, 'accepted', req)}
                  >
                    {actionLoading === req.$id ? '⏳ Sending...' : <><FaCheck /> Accept</>}
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                    disabled={actionLoading === req.$id}
                    onClick={() => handleAction(req.$id, 'rejected', req)}
                  >
                    <FaTimes /> Reject
                  </button>
                </>)}
                <button
                  className="btn btn-danger"
                  style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                  disabled={actionLoading === req.$id}
                  onClick={() => handleDelete(req.$id)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Packages Tab ─────────────────────────────────────────────────────────────

function PackagesTab() {
  const [packages, setPackages]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ title: '', description: '', price: '', features: '' })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getPackages()
      setPackages(res.documents)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.title) { setFormError('Title is required.'); return }
    setSaving(true)
    try {
      let imageId = ''
      if (imageFile) {
        const uploaded = await uploadPackageImage(imageFile)
        imageId = uploaded.$id
      }
      await createPackage({ ...form, imageId })
      setForm({ title: '', description: '', price: '', features: '' })
      setImageFile(null)
      setShowForm(false)
      await load()
    } catch (err) {
      setFormError('Failed to create package. Check Appwrite config.')
      console.error(err)
    }
    setSaving(false)
  }

  const handleDelete = async (pkg) => {
    if (!confirm(`Delete package "${pkg.title}"?`)) return
    try { await deletePackage(pkg.$id, pkg.imageId); await load() } catch (err) { console.error(err) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>Diagnostic Packages</h2>
        <button className="btn btn-gold" onClick={() => setShowForm(!showForm)} style={{ fontSize: '0.88rem' }}>
          <FaPlus /> {showForm ? 'Cancel' : 'Add Package'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 20 }}>Create New Package</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Package Title *</label>
                <input type="text" placeholder="e.g. Complete Health Checkup" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" placeholder="e.g. 999" value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} placeholder="Package description..." value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'none' }} />
            </div>
            <div className="form-group">
              <label>Features (one per line)</label>
              <textarea rows={4} placeholder="CBC Test&#10;Lipid Profile&#10;Blood Sugar" value={form.features}
                onChange={e => setForm({ ...form, features: e.target.value })} style={{ resize: 'none' }} />
            </div>
            <div className="form-group">
              <label>Package Image</label>
              <div style={{ border: '2px dashed rgba(14,116,144,0.3)', borderRadius: 8, padding: '20px', textAlign: 'center' }}>
                <input type="file" accept="image/*" id="pkg-img" style={{ display: 'none' }}
                  onChange={e => setImageFile(e.target.files[0])} />
                <label htmlFor="pkg-img" style={{ cursor: 'pointer', color: 'var(--gray-400)', fontSize: '0.88rem' }}>
                  <FaUpload style={{ marginRight: 8 }} />
                  {imageFile ? imageFile.name : 'Click to upload image (optional)'}
                </label>
              </div>
            </div>
            {formError && <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: 12 }}>{formError}</p>}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Create Package'}
            </button>
          </form>
        </div>
      )}

      {loading ? <Loader /> : packages.length === 0 ? <Empty label="No packages yet. Create your first one!" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {packages.map(pkg => (
            <PackageAdminCard key={pkg.$id} pkg={pkg} onDelete={() => handleDelete(pkg)} />
          ))}
        </div>
      )}
    </div>
  )
}

function PackageAdminCard({ pkg, onDelete }) {
  const [imgUrl, setImgUrl] = useState('')
  useEffect(() => {
    if (pkg.imageId) setImgUrl(String(getImagePreviewUrl(pkg.imageId)))
  }, [pkg.imageId])

  return (
    <div style={{ background: 'rgba(15,32,68,0.7)', border: '1px solid rgba(14,116,144,0.2)', borderRadius: 12, overflow: 'hidden' }}>
      {imgUrl
        ? <img src={imgUrl} alt={pkg.title} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
        : <div style={{ height: 100, background: 'rgba(14,116,144,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🧪</div>
      }
      <div style={{ padding: '16px 20px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 4, color: 'var(--white)' }}>{pkg.title}</h3>
        {pkg.price && <div style={{ color: 'var(--gold-light)', fontWeight: 700, marginBottom: 8 }}>₹{pkg.price}</div>}
        <p style={{ fontSize: '0.83rem', color: 'var(--gray-400)', marginBottom: 16, lineHeight: 1.5 }}>
          {pkg.description?.slice(0, 80)}{pkg.description?.length > 80 ? '...' : ''}
        </p>
        <button className="btn btn-danger" onClick={onDelete} style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}>
          <FaTrash /> Delete Package
        </button>
      </div>
    </div>
  )
}

// ─── Feedback Tab ─────────────────────────────────────────────────────────────

function FeedbackTab() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getFeedback()
      setFeedbacks(res.documents)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete feedback from "${name}"?`)) return
    try { await deleteFeedback(id); await load() } catch (err) { console.error(err) }
  }

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((a, f) => a + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : '–'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>Customer Feedback</h2>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold-light)' }}>{avgRating}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)' }}>Avg Rating</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--teal-light)' }}>{feedbacks.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)' }}>Total Reviews</div>
          </div>
        </div>
      </div>

      {loading ? <Loader /> : feedbacks.length === 0 ? <Empty label="No feedback yet." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {feedbacks.map(fb => (
            <div key={fb.$id} style={{ background: 'rgba(15,32,68,0.7)', border: '1px solid rgba(14,116,144,0.2)', borderRadius: 12, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontWeight: 600, color: 'var(--white)' }}>{fb.name}</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: i < fb.rating ? 'var(--gold)' : 'var(--gray-600)', fontSize: '0.85rem' }}>★</span>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', lineHeight: 1.5, marginBottom: 14 }}>{fb.message}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>{new Date(fb.$createdAt).toLocaleDateString('en-IN')}</span>
                <button className="btn btn-danger" onClick={() => handleDelete(fb.$id, fb.name)} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Loader() {
  return <div style={{ textAlign: 'center', padding: '48px', color: 'var(--teal-light)', fontSize: '0.9rem' }}>⏳ Loading...</div>
}

function Empty({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', border: '1px dashed rgba(14,116,144,0.3)', borderRadius: 16, color: 'var(--gray-400)' }}>
      {label}
    </div>
  )
}


// ─── Admissions Tab ───────────────────────────────────────────────────────────

const ADM_STATUS = {
  pending:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   label: 'Pending'   },
  accepted:  { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Accepted'  },
  rejected:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Rejected'  },
  cancelled: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Cancelled' },
}

function AdmissionsTab() {
  const [admissions, setAdmissions]       = useState([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState("all")
  const [actionLoading, setActionLoading] = useState(null)
  const [expanded, setExpanded]           = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getAllAdmissions()
      setAdmissions(res.documents)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleStatus = async (id, status) => {
    setActionLoading(id)
    try { await updateAdmissionStatus(id, status); await load() }
    catch (err) { console.error(err) }
    setActionLoading(null)
  }

  const handleDelete = async (id, name) => {
    if (!confirm("Delete admission for " + name + "?")) return
    try { await deleteAdmissionDoc(id); await load() } catch (err) { console.error(err) }
  }

  const filtered = filter === "all" ? admissions : admissions.filter(a => a.status === filter)
  const counts = {
    all: admissions.length,
    pending:   admissions.filter(a => a.status === "pending").length,
    accepted:  admissions.filter(a => a.status === "accepted").length,
    rejected:  admissions.filter(a => a.status === "rejected").length,
    cancelled: admissions.filter(a => a.status === "cancelled").length,
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"1.8rem", marginBottom:4 }}>Student Admissions</h2>
          <p style={{ color:"var(--gray-400)", fontSize:"0.82rem" }}>
            Review applications submitted by students. Accept or reject to update their status.
          </p>
        </div>
        <button onClick={load} className="btn btn-outline" style={{ padding:"7px 16px", fontSize:"0.82rem", flexShrink:0 }}>Refresh</button>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {["all","pending","accepted","rejected","cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:"7px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:"0.82rem",
            background: filter===f ? "var(--teal)" : "rgba(14,116,144,0.1)",
            color: filter===f ? "white" : "var(--gray-400)",
            fontFamily:"var(--font-body)",
          }}>
            {f.charAt(0).toUpperCase()+f.slice(1)} ({counts[f]||0})
          </button>
        ))}
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? <Empty label="No admission applications found." /> : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(adm => {
            const cfg = ADM_STATUS[adm.status] || ADM_STATUS.pending
            const isExp = expanded === adm.$id
            return (
              <div key={adm.$id} style={{ background:"rgba(15,32,68,0.7)", border:"1px solid rgba(14,116,144,0.2)", borderRadius:12, overflow:"hidden", opacity: actionLoading===adm.$id ? 0.65 : 1 }}>
                <div style={{ padding:"16px 22px", display:"grid", gridTemplateColumns:"1fr auto", gap:12, alignItems:"center" }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"var(--font-display)", fontSize:"1.05rem", color:"var(--white)" }}>{adm.name}</span>
                      <span style={{ fontSize:"0.72rem", padding:"2px 10px", borderRadius:12, background:cfg.bg, color:cfg.color, fontWeight:600 }}>{cfg.label}</span>
                      <span style={{ fontSize:"0.75rem", color:"var(--teal-light)", background:"rgba(14,116,144,0.1)", padding:"2px 10px", borderRadius:12 }}>{adm.course}</span>
                    </div>
                    <div style={{ display:"flex", gap:18, flexWrap:"wrap", fontSize:"0.82rem", color:"var(--gray-400)" }}>
                      <span>Age {adm.age}</span>
                      <span>{adm.phone}</span>
                      <span>{adm.email}</span>
                      <span style={{ fontSize:"0.75rem", color:"var(--gray-600)" }}>{new Date(adm.$createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", justifyContent:"flex-end" }}>
                    <button onClick={() => setExpanded(isExp ? null : adm.$id)} style={{ background:"none", border:"none", color:"var(--teal-light)", cursor:"pointer", fontSize:"0.8rem", padding:"6px 12px" }}>
                      {isExp ? "Hide" : "Details"}
                    </button>
                    {adm.status === "pending" && (
                      <>
                        <button className="btn btn-success" disabled={actionLoading===adm.$id} onClick={() => handleStatus(adm.$id,"accepted")} style={{ padding:"6px 14px", fontSize:"0.8rem" }}>
                          <FaCheck /> Accept
                        </button>
                        <button className="btn btn-danger" disabled={actionLoading===adm.$id} onClick={() => handleStatus(adm.$id,"rejected")} style={{ padding:"6px 12px", fontSize:"0.8rem" }}>
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                    {(adm.status==="accepted"||adm.status==="rejected") && (
                      <button className="btn btn-outline" onClick={() => handleStatus(adm.$id,"pending")} style={{ padding:"6px 12px", fontSize:"0.78rem", color:"var(--gray-400)" }}>Reset</button>
                    )}
                    <button className="btn btn-danger" disabled={actionLoading===adm.$id} onClick={() => handleDelete(adm.$id,adm.name)} style={{ padding:"6px 10px", fontSize:"0.8rem" }}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
                {isExp && (
                  <div style={{ padding:"0 22px 20px", borderTop:"1px solid rgba(14,116,144,0.1)" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"8px 28px", paddingTop:16 }}>
                      {[
                        {label:"Age",           val:adm.age+" years"},
                        {label:"Phone",         val:adm.phone},
                        {label:"Email",         val:adm.email},
                        {label:"Address",       val:adm.address},
                        {label:"Qualification", val:adm.qualification},
                        {label:"Course",        val:adm.course},
                      ].map(r => (
                        <div key={r.label}>
                          <div style={{ fontSize:"0.68rem", color:"var(--gray-600)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:1 }}>{r.label}</div>
                          <div style={{ color:"var(--white)", fontSize:"0.87rem" }}>{r.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
