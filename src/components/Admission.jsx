import { useState, useEffect, useRef } from 'react'
import {
  FaGraduationCap, FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash,
  FaTimes, FaCheckCircle, FaTimesCircle, FaSignOutAlt, FaEdit,
  FaPhone, FaMapMarkerAlt, FaBook, FaIdCard,
} from 'react-icons/fa'
import emailjs from 'emailjs-com'
import {
  studentSignup, studentLogin, studentLogout, getStudentSession,
  createAdmission, getMyAdmission, cancelAdmission, reactivateAdmission,
  deleteAdmissionDoc, ADMIN_EMAIL,
} from '../appwrite'

// ─── Static Data ──────────────────────────────────────────────────────────────
const COURSES = [
  { group: 'Paramedical (12th any stream)', items: [
    'Medical Lab Technology', 'Optometry Technician', 'Operation Theatre',
    'Cardiac Care Technology', 'Physiotherapy', 'Dialysis Technician',
    'Radiology and Imaging Technology', 'E.M.T. (Emergency Medical Technician)',
    'BNYS - Bachelor of Naturopathy and Yogic Sciences',
  ]},
  { group: 'Certificate (10th minimum)', items: [
    'Dresser (Medical)', 'CMS and ED - Community Medical Services',
  ]},
  { group: 'Computer Courses', items: [
    'DCA - Diploma in Computer Applications',
    'ADCA - Advanced Diploma in Computer Applications',
    'PGDCA - Post Graduate Diploma in Computer Applications',
    'TALLY - Accounting and GST Software',
    'TYPING - Hindi / English',
  ]},
  { group: 'UG Programs', items: [
    'B.A. - Bachelor of Arts', 'B.COM - Bachelor of Commerce', 'B.SC - Bachelor of Science',
  ]},
  { group: 'PG Programs', items: [
    'M.SC - Master of Science', 'MCA - Master of Computer Applications',
    'MBA - Master of Business Administration', 'M.LIB - Master of Library Science',
    'MSW - Master of Social Work',
  ]},
]

const QUALIFICATIONS = [
  '10th Pass', '12th Pass (Arts)', '12th Pass (Science)', '12th Pass (Commerce)',
  'Diploma', 'Graduation (B.A.)', 'Graduation (B.COM)', 'Graduation (B.SC)',
  'Graduation (Other)', 'Post Graduation', 'Other',
]

const STATUS_MAP = {
  pending:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.3)',  label: 'Pending Review'  },
  accepted:  { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.3)',  label: 'Accepted'        },
  rejected:  { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.3)',   label: 'Rejected'        },
  cancelled: { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.3)', label: 'Cancelled by You'},
}

// ─── Email Helper ─────────────────────────────────────────────────────────────
async function sendMail(toEmail, params) {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      { to_email: toEmail, ...params },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
    return true
  } catch (err) {
    console.warn('Email to ' + toEmail + ' failed:', err)
    return false
  }
}

async function notifyAdmin(data, eventType) {
  const isNew = eventType === 'new'

  const adminBody = [
    isNew
      ? 'A new student submitted an admission application at RIMS.'
      : 'A student has CANCELLED their admission application.',
    '',
    'Name          : ' + data.name,
    'Age           : ' + data.age,
    'Phone         : ' + data.phone,
    'Email         : ' + data.email,
    'Address       : ' + data.address,
    'Course        : ' + data.course,
    'Qualification : ' + data.qualification,
    '',
    'Log in to the admin panel to review and take action.',
  ].join('\n')

  // ── Email to ADMIN ──────────────────────────────────────────────────────────
  await sendMail(ADMIN_EMAIL, {
    subject:        isNew
      ? 'New Admission Application - ' + data.name
      : 'Admission Cancelled - ' + data.name,
    patient_name:   data.name,
    patient_phone:  data.phone,
    patient_email:  data.email,
    status:         isNew ? 'NEW APPLICATION' : 'CANCELLED',
    message:        adminBody,
    institute_name: 'Raj Institute of Medical Sciences',
    contact_number: '+91 74885 37035',
  })

  // ── Confirmation email to STUDENT ───────────────────────────────────────────
  if (data.email) {
    const studentBody = isNew
      ? [
          'Dear ' + data.name + ',',
          '',
          'Thank you for applying to Raj Institute of Medical Sciences!',
          'Your admission application has been successfully submitted.',
          '',
          'Application Summary',
          '-------------------',
          'Course Applied   : ' + data.course,
          'Qualification    : ' + data.qualification,
          'Contact Number   : ' + data.phone,
          '',
          'Our team will review your application and contact you at ' + data.phone + ' or ' + data.email + ' within 1-2 working days.',
          '',
          'For any queries, call us at +91 74885 37035.',
          '',
          'Best regards,',
          'Dr. Pankaj Kumar',
          'Raj Institute of Medical Sciences',
        ].join('\n')
      : [
          'Dear ' + data.name + ',',
          '',
          'Your admission application at Raj Institute of Medical Sciences has been CANCELLED as per your request.',
          '',
          'Course           : ' + data.course,
          'Qualification    : ' + data.qualification,
          '',
          'If you change your mind, you can log back in and reactivate your application anytime.',
          '',
          'For any queries, call us at +91 74885 37035.',
          '',
          'Best regards,',
          'Dr. Pankaj Kumar',
          'Raj Institute of Medical Sciences',
        ].join('\n')

    await sendMail(data.email, {
      subject:        isNew
        ? 'Admission Application Received - RIMS'
        : 'Your Admission Application has been Cancelled - RIMS',
      patient_name:   data.name,
      patient_phone:  data.phone,
      patient_email:  data.email,
      status:         isNew ? 'APPLICATION RECEIVED' : 'CANCELLED',
      message:        studentBody,
      institute_name: 'Raj Institute of Medical Sciences',
      contact_number: '+91 74885 37035',
    })
  }
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function Admission() {
  const [student, setStudent]               = useState(null)
  const [admission, setAdmission]           = useState(null)
  const [view, setView]                     = useState('info')
  const [authMode, setAuthMode]             = useState('login')
  const [sessionLoading, setSessionLoading] = useState(true)
  const ref = useRef()

  useEffect(() => {
    getStudentSession().then(async (user) => {
      if (user) {
        setStudent(user)
        const adm = await getMyAdmission(user.$id)
        setAdmission(adm)
        setView('dashboard')
      }
      setSessionLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!ref.current || sessionLoading) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.05 }
    )
    // small delay so DOM is fully painted before observing
    const timer = setTimeout(() => {
      ref.current.querySelectorAll('.fade-in').forEach((el) => {
        el.classList.remove('visible')
        obs.observe(el)
      })
    }, 50)
    return () => { clearTimeout(timer); obs.disconnect() }
  }, [view, admission, sessionLoading])

  const refreshAdmission = async () => {
    if (!student) return
    const adm = await getMyAdmission(student.$id)
    setAdmission(adm)
  }

  const handleLogout = async () => {
    await studentLogout()
    setStudent(null)
    setAdmission(null)
    setView('info')
  }

  const handleCancel = async () => {
    if (!admission) return
    if (!confirm('Are you sure you want to cancel your admission application?')) return
    await cancelAdmission(admission.$id)
    await notifyAdmin(admission, 'cancel')
    await refreshAdmission()
  }

  const handleReactivate = async () => {
    if (!admission) return
    await reactivateAdmission(admission.$id)
    await refreshAdmission()
  }

  const handleDelete = async () => {
    if (!admission) return
    if (!confirm('Permanently delete your application? You can apply fresh after this.')) return
    await deleteAdmissionDoc(admission.$id)
    setAdmission(null)
  }

  if (sessionLoading) {
    return (
      <section id="admission" className="section" style={{ background: 'rgba(10,22,40,0.45)' }}>
        <div className="container" style={{ textAlign: 'center', padding: '80px 0', color: 'var(--teal-light)' }}>
          Loading...
        </div>
      </section>
    )
  }

  return (
    <section
      id="admission"
      ref={ref}
      className="section"
      style={{
        background: 'linear-gradient(180deg,rgba(10,22,40,0.55) 0%,rgba(10,22,40,0.3) 100%)',
        borderTop: '1px solid rgba(201,168,76,0.12)',
        borderBottom: '1px solid rgba(14,116,144,0.12)',
      }}
    >
      <div className="container">
        <div className="fade-in" style={{ marginBottom: 48 }}>
          <div className="gold-line" />
          <h2 className="section-title">Admission</h2>
          <p className="section-subtitle">
            Apply for any of our 20+ programs. Create an account once and track your application anytime.
          </p>
        </div>

        {view === 'info' && <InfoView onApply={() => setView('auth')} />}

        {view === 'auth' && (
          <AuthView
            mode={authMode}
            setMode={setAuthMode}
            onBack={() => setView('info')}
            onSuccess={async (user) => {
              setStudent(user)
              const adm = await getMyAdmission(user.$id)
              setAdmission(adm)
              setView('dashboard')
            }}
          />
        )}

        {view === 'dashboard' && student && (
          <StudentDashboard
            student={student}
            admission={admission}
            onApply={() => setView('form')}
            onLogout={handleLogout}
            onCancel={handleCancel}
            onReactivate={handleReactivate}
            onDelete={handleDelete}
            onRefresh={refreshAdmission}
          />
        )}

        {view === 'form' && student && (
          <AdmissionForm
            student={student}
            onBack={() => setView('dashboard')}
            onSuccess={async (doc) => {
              setAdmission(doc)
              setView('dashboard')
            }}
          />
        )}
      </div>
    </section>
  )
}

// ─── Info View ────────────────────────────────────────────────────────────────
function InfoView({ onApply }) {
  const steps = [
    { n: 1, icon: '📝', title: 'Create Account', desc: 'Sign up free with your email and a password.' },
    { n: 2, icon: '📋', title: 'Fill the Form',  desc: 'Enter your name, age, contact, course and qualifications.' },
    { n: 3, icon: '📧', title: 'Admin Notified', desc: 'Our team receives your details and reviews your application.' },
    { n: 4, icon: '📞', title: 'We Contact You', desc: 'Admin will call or email you to confirm enrollment.' },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }} className="adm-info-grid">
        <div className="fade-in">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', color: 'var(--white)', marginBottom: 28 }}>
            How to Apply
          </h3>
          {steps.map((s) => (
            <div key={s.n} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(14,116,144,0.12)', border: '1px solid rgba(14,116,144,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
              }}>{s.icon}</div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{s.n}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--white)' }}>{s.title}</span>
                </div>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.87rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
          <button onClick={onApply} className="btn btn-gold" style={{ marginTop: 8, padding: '13px 36px', fontSize: '1rem' }}>
            <FaGraduationCap /> Apply Now
          </button>
        </div>

        <div className="fade-in">
          <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 18, padding: '32px 28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--gold-light)', marginBottom: 22 }}>Why Choose RIMS?</h3>
            {[
              { e: '🏛️', t: 'Affiliated with UGC Approved Universities, GSDM and NSDM' },
              { e: '📚', t: '20+ courses - Paramedical, Computer and Degree programs' },
              { e: '🔬', t: 'On-site diagnostic lab for hands-on practical training' },
              { e: '👨‍⚕️', t: 'Led by Dr. Pankaj Kumar with years of medical expertise' },
              { e: '💼', t: 'Placement assistance and career guidance for students' },
              { e: '📜', t: 'Digitally verifiable certificates after course completion' },
            ].map((i) => (
              <div key={i.t} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ flexShrink: 0, fontSize: '1.1rem' }}>{i.e}</span>
                <span style={{ color: 'var(--gray-400)', fontSize: '0.88rem', lineHeight: 1.55 }}>{i.t}</span>
              </div>
            ))}
            <div style={{ marginTop: 24, padding: '16px 18px', background: 'rgba(14,116,144,0.08)', borderRadius: 10, border: '1px solid rgba(14,116,144,0.18)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Contact Admissions</div>
              <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: 2 }}>+91 74885 37035</div>
              <div style={{ color: 'var(--teal-light)', fontSize: '0.85rem' }}>pankajosank1994@gmail.com</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.adm-info-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  )
}

// ─── Auth View ────────────────────────────────────────────────────────────────
function AuthView({ mode, setMode, onSuccess, onBack }) {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    if (!form.email || !form.password) return 'Please fill in all required fields.'
    if (mode === 'signup') {
      if (!form.name.trim())              return 'Please enter your full name.'
      if (form.password.length < 8)       return 'Password must be at least 8 characters.'
      if (form.password !== form.confirm) return 'Passwords do not match.'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      if (mode === 'signup') await studentSignup(form.email, form.password, form.name)
      else await studentLogin(form.email, form.password)
      const user = await getStudentSession()
      onSuccess(user)
    } catch (err) {
      const m = err.message || ''
      if (m.includes('already exists') || m.includes('already a member'))
        setError('An account with this email already exists. Please log in.')
      else if (m.includes('Invalid credentials') || m.includes('password'))
        setError('Incorrect email or password. Please try again.')
      else setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="fade-in" style={{ maxWidth: 460, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--teal-light)', cursor: 'pointer', fontSize: '0.88rem', marginBottom: 24, padding: 0 }}>
        Back to Admission Info
      </button>

      <div className="card" style={{ padding: '36px 32px' }}>
        <div style={{ display: 'flex', background: 'rgba(10,22,40,0.7)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
          {['login', 'signup'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: mode === m ? 'var(--teal)' : 'transparent',
              color: mode === m ? 'white' : 'var(--gray-400)',
              fontFamily: 'var(--font-body)', fontSize: '0.88rem',
              fontWeight: mode === m ? 600 : 400, transition: 'all 0.2s',
            }}>
              {m === 'login' ? 'Student Login' : 'Create Account'}
            </button>
          ))}
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 4 }}>
          {mode === 'login' ? 'Welcome Back!' : 'Join RIMS'}
        </h3>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.82rem', marginBottom: 24 }}>
          {mode === 'login' ? 'Log in to manage your admission application.' : 'Create an account to apply for admission at RIMS.'}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <FaUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)', fontSize: '0.8rem' }} />
                <input type="text" placeholder="Your full name" value={form.name} onChange={upd('name')} style={{ paddingLeft: 40 }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)', fontSize: '0.8rem' }} />
              <input type="email" placeholder="yourname@gmail.com" value={form.email} onChange={upd('email')} style={{ paddingLeft: 40 }} />
            </div>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)', fontSize: '0.8rem' }} />
              <input type={showPw ? 'text' : 'password'} placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Your password'}
                value={form.password} onChange={upd('password')} style={{ paddingLeft: 40, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-600)', cursor: 'pointer' }}>
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label>Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-600)', fontSize: '0.8rem' }} />
                <input type={showPw ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirm} onChange={upd('confirm')} style={{ paddingLeft: 40 }} />
              </div>
            </div>
          )}

          {error && <ErrBox msg={error} />}

          <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '0.95rem' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: 'var(--gray-600)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--teal-light)', cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}>
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  )
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({ student, admission, onApply, onLogout, onCancel, onReactivate, onDelete, onRefresh }) {
  const cfg = admission ? STATUS_MAP[admission.status] : null

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: 'white' }}>
            {(student.name || student.email)[0].toUpperCase()}
          </div>
          <div>
            <div style={{ color: 'var(--white)', fontWeight: 600 }}>{student.name || 'Student'}</div>
            <div style={{ color: 'var(--gray-600)', fontSize: '0.78rem' }}>{student.email}</div>
          </div>
        </div>
        <button onClick={onLogout} className="btn btn-outline" style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
          <FaSignOutAlt /> Log Out
        </button>
      </div>

      {!admission && (
        <div style={{ textAlign: 'center', padding: '52px 32px', border: '1px dashed rgba(201,168,76,0.3)', borderRadius: 16, background: 'rgba(201,168,76,0.02)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📋</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--white)', marginBottom: 10 }}>No Application Yet</h3>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: 380, margin: '0 auto 28px' }}>
            Fill in your admission form to apply for a course at RIMS. It takes less than 2 minutes.
          </p>
          <button onClick={onApply} className="btn btn-gold" style={{ padding: '12px 36px', fontSize: '1rem' }}>
            <FaEdit /> Fill Admission Form
          </button>
        </div>
      )}

      {admission && (
        <>
          <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ color: cfg.color, fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>
                Application Status: {cfg.label}
              </div>
              <div style={{ color: 'var(--gray-600)', fontSize: '0.78rem' }}>
                Submitted on {new Date(admission.$createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <button onClick={onRefresh} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '0.82rem' }}>Refresh</button>
          </div>

          <div className="card" style={{ padding: '28px 30px', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 20 }}>Your Application Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }} className="adm-detail-grid">
              {[
                { icon: <FaUser />,          label: 'Full Name',     val: admission.name },
                { icon: <FaIdCard />,        label: 'Age',           val: admission.age + ' years' },
                { icon: <FaPhone />,         label: 'Phone',         val: admission.phone },
                { icon: <FaEnvelope />,      label: 'Email',         val: admission.email },
                { icon: <FaMapMarkerAlt />,  label: 'Address',       val: admission.address },
                { icon: <FaGraduationCap />, label: 'Qualification', val: admission.qualification },
              ].map((r) => (
                <div key={r.label} style={{ padding: '12px 0', borderBottom: '1px solid rgba(14,116,144,0.08)', display: 'flex', gap: 10 }}>
                  <span style={{ color: 'var(--teal)', marginTop: 2, fontSize: '0.82rem', flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{r.label}</div>
                    <div style={{ color: 'var(--white)', fontSize: '0.9rem' }}>{r.val}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(14,116,144,0.08)', display: 'flex', gap: 10, gridColumn: '1/-1' }}>
                <span style={{ color: 'var(--teal)', marginTop: 2, fontSize: '0.82rem', flexShrink: 0 }}><FaBook /></span>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Course Applied</div>
                  <div style={{ color: 'var(--teal-light)', fontWeight: 600, fontSize: '0.95rem' }}>{admission.course}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {admission.status === 'pending' && (
              <button onClick={onCancel} className="btn btn-outline" style={{ fontSize: '0.88rem', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.35)' }}>
                <FaTimes /> Cancel Application
              </button>
            )}
            {admission.status === 'cancelled' && (
              <>
                <button onClick={onReactivate} className="btn btn-gold" style={{ fontSize: '0.88rem' }}>
                  <FaCheckCircle /> Reactivate Application
                </button>
                <button onClick={onDelete} className="btn btn-danger" style={{ fontSize: '0.88rem' }}>
                  <FaTimesCircle /> Delete and Apply Fresh
                </button>
              </>
            )}
            {admission.status === 'rejected' && (
              <button onClick={onDelete} className="btn btn-outline" style={{ fontSize: '0.88rem' }}>
                <FaEdit /> Delete and Apply Again
              </button>
            )}
          </div>

          {admission.status === 'pending' && (
            <p style={{ color: 'var(--gray-600)', fontSize: '0.8rem', marginTop: 12, lineHeight: 1.6 }}>
              Our team will contact you at {admission.phone} or {admission.email} within 1-2 working days.
            </p>
          )}
          {admission.status === 'cancelled' && (
            <p style={{ color: 'var(--gray-600)', fontSize: '0.8rem', marginTop: 12 }}>
              You can reactivate your existing application or delete it and start fresh with updated details.
            </p>
          )}
        </>
      )}
      <style>{`@media(max-width:580px){.adm-detail-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  )
}

// ─── Admission Form ───────────────────────────────────────────────────────────
function AdmissionForm({ student, onSuccess, onBack }) {
  const [form, setForm] = useState({
    name: student.name || '',
    age: '',
    phone: '',
    email: student.email || '',
    address: '',
    course: '',
    qualification: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    if (Object.values(form).some((v) => !v.toString().trim())) return 'Please fill in all fields.'
    if (isNaN(form.age) || Number(form.age) < 14 || Number(form.age) > 60) return 'Please enter a valid age (14-60).'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email address.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      const doc = await createAdmission({ ...form, userId: student.$id })
      await notifyAdmin(form, 'new')
      onSuccess(doc)
    } catch (err) {
      if (err.message?.includes('already exists'))
        setError('You already have an application. Go back to view it.')
      else setError('Submission failed. Please try again.')
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--teal-light)', cursor: 'pointer', fontSize: '0.88rem', marginBottom: 24, padding: 0 }}>
        Back to Dashboard
      </button>

      <div className="card" style={{ padding: '36px 36px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', marginBottom: 4 }}>Admission Application</h3>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.84rem', marginBottom: 28 }}>
          Fill in your details below. Admin will be notified automatically once you submit.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-two-col">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" placeholder="As per school certificate" value={form.name} onChange={upd('name')} />
            </div>
            <div className="form-group">
              <label>Age *</label>
              <input type="number" placeholder="e.g. 20" min="14" max="60" value={form.age} onChange={upd('age')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-two-col">
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={upd('phone')} />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" placeholder="yourname@gmail.com" value={form.email} onChange={upd('email')} />
            </div>
          </div>

          <div className="form-group">
            <label>Complete Address *</label>
            <textarea rows={2} placeholder="Village / City, District, State, PIN" value={form.address} onChange={upd('address')} style={{ resize: 'none' }} />
          </div>

          <div className="form-group">
            <label>Highest Qualification *</label>
            <select value={form.qualification} onChange={upd('qualification')} style={{ width: '100%', background: 'rgba(10,22,40,0.85)', border: '1.5px solid rgba(14,116,144,0.25)', borderRadius: 8, padding: '11px 14px', color: form.qualification ? 'var(--white)' : 'var(--gray-600)', fontFamily: 'var(--font-body)', fontSize: '0.92rem', outline: 'none', cursor: 'pointer' }}>
              <option value="">Select your qualification</option>
              {QUALIFICATIONS.map((q) => (
                <option key={q} value={q} style={{ background: '#0a1628', color: 'white' }}>{q}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Course You Want to Pursue *</label>
            <select value={form.course} onChange={upd('course')} style={{ width: '100%', background: 'rgba(10,22,40,0.85)', border: '1.5px solid rgba(14,116,144,0.25)', borderRadius: 8, padding: '11px 14px', color: form.course ? 'var(--teal-light)' : 'var(--gray-600)', fontFamily: 'var(--font-body)', fontSize: '0.92rem', outline: 'none', cursor: 'pointer' }}>
              <option value="">Select a course</option>
              {COURSES.map((g) => (
                <optgroup key={g.group} label={g.group} style={{ color: '#9ca3af', background: '#0a1628' }}>
                  {g.items.map((c) => (
                    <option key={c} value={c} style={{ background: '#0a1628', color: 'white' }}>{c}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {error && <ErrBox msg={error} />}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            <button type="submit" className="btn btn-gold" disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: '13px', fontSize: '0.95rem', minWidth: 200 }}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button type="button" onClick={onBack} className="btn btn-outline" style={{ padding: '13px 22px' }}>
              Cancel
            </button>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: 12, lineHeight: 1.6 }}>
            Upon submission, our admin team is automatically notified via email and will reach out within 1-2 working days.
          </p>
        </form>
      </div>
      <style>{`@media(max-width:600px){.form-two-col{grid-template-columns:1fr!important;}}`}</style>
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────
function ErrBox({ msg }) {
  return (
    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#fca5a5', fontSize: '0.85rem' }}>
      {msg}
    </div>
  )
}