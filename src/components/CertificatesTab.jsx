import { useState, useEffect } from 'react'
import { FaUpload, FaTrash, FaFilePdf, FaCertificate, FaEye } from 'react-icons/fa'
import {
  getCertificates, createCertificate, deleteCertificate,
  uploadCertificatePDF, getCertificateViewUrl, getCertificateDownloadUrl,
} from '../appwrite'

export default function CertificatesTab() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ enrollmentNo: '', studentName: '', studentPhone: '', issuedDate: '' })
  const [pdfFile, setPdfFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getCertificates()
      setCerts(res.documents)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!form.enrollmentNo.trim()) { setFormError('Enrollment number is required.'); return }
    if (!form.studentPhone.trim()) { setFormError('Student phone number is required.'); return }
    if (!form.studentName.trim()) { setFormError('Student name is required.'); return }
    if (!pdfFile) { setFormError('Please select a PDF certificate file.'); return }
    if (pdfFile.type !== 'application/pdf') { setFormError('Only PDF files are allowed.'); return }
    if (pdfFile.size > 10 * 1024 * 1024) { setFormError('PDF file must be under 10MB.'); return }

    // Check for duplicate enrollment no
    const duplicate = certs.find(c => c.enrollmentNo === form.enrollmentNo.trim().toUpperCase())
    if (duplicate) { setFormError(`Certificate for enrollment no. "${form.enrollmentNo.toUpperCase()}" already exists.`); return }

    setSaving(true)
    try {
      const uploaded = await uploadCertificatePDF(pdfFile)
      await createCertificate({
        enrollmentNo: form.enrollmentNo,
        studentName: form.studentName,
        studentPhone: form.studentPhone,
        fileId: uploaded.$id,
        issuedDate: form.issuedDate || new Date().toISOString(),
      })
      setFormSuccess(`Certificate uploaded for ${form.studentName} (${form.enrollmentNo.toUpperCase()})`)
      setForm({ enrollmentNo: '', studentName: '', studentPhone: '', issuedDate: '' })
      setPdfFile(null)
      // Reset file input
      const fileInput = document.getElementById('cert-pdf-input')
      if (fileInput) fileInput.value = ''
      await load()
      setTimeout(() => { setFormSuccess(''); setShowForm(false) }, 2500)
    } catch (err) {
      setFormError('Upload failed. Check Appwrite config and bucket permissions.')
      console.error(err)
    }
    setSaving(false)
  }

  const handleDelete = async (cert) => {
    if (!confirm(`Delete certificate for "${cert.studentName}" (${cert.enrollmentNo})?`)) return
    setDeleteLoading(cert.$id)
    try {
      await deleteCertificate(cert.$id, cert.fileId)
      await load()
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
    setDeleteLoading(null)
  }

  const filtered = certs.filter(c =>
    !search ||
    c.enrollmentNo.toLowerCase().includes(search.toLowerCase()) ||
    c.studentName.toLowerCase().includes(search.toLowerCase()) ||
    c.studentPhone.includes(search)
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 4 }}>Certificates</h2>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>
            Upload, manage and delete student certificates
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={load} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>↻ Refresh</button>
          <button className="btn btn-gold" onClick={() => { setShowForm(!showForm); setFormError(''); setFormSuccess('') }} style={{ fontSize: '0.88rem' }}>
            <FaUpload /> {showForm ? 'Cancel Upload' : 'Upload Certificate'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Certificates', val: certs.length, color: 'var(--teal-light)' },
          { label: 'Uploaded This Month', val: certs.filter(c => new Date(c.$createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length, color: 'var(--gold-light)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(15,32,68,0.7)', border: '1px solid rgba(14,116,144,0.2)',
            borderRadius: 10, padding: '16px 24px',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: s.color }}>{s.val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upload Form */}
      {showForm && (
        <div style={{
          background: 'rgba(15,32,68,0.8)', border: '1px solid rgba(201,168,76,0.25)',
          borderRadius: 14, padding: 32, marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <FaCertificate style={{ color: 'var(--gold-light)', fontSize: '1.2rem' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>Upload New Certificate</h3>
          </div>

          {formSuccess && (
            <div style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#6ee7b7', fontSize: '0.88rem',
            }}>
              ✅ {formSuccess}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 4 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Enrollment Number *</label>
                <input
                  type="text"
                  placeholder="e.g. RIMS2024001"
                  value={form.enrollmentNo}
                  onChange={e => setForm({ ...form, enrollmentNo: e.target.value.toUpperCase() })}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.06em' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Student Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar Singh"
                  value={form.studentName}
                  onChange={e => setForm({ ...form, studentName: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Student Phone No. (Proof) *</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.studentPhone}
                  onChange={e => setForm({ ...form, studentPhone: e.target.value })}
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: 4 }}>
                  Stored securely — not shown to student
                </p>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Issue Date</label>
                <input
                  type="date"
                  value={form.issuedDate ? form.issuedDate.slice(0, 10) : ''}
                  onChange={e => setForm({ ...form, issuedDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                />
              </div>
            </div>

            {/* PDF Upload */}
            <div className="form-group" style={{ marginTop: 20 }}>
              <label>Certificate PDF File *</label>
              <div style={{
                border: `2px dashed ${pdfFile ? 'rgba(16,185,129,0.5)' : 'rgba(201,168,76,0.3)'}`,
                borderRadius: 10, padding: '28px 20px', textAlign: 'center',
                background: pdfFile ? 'rgba(16,185,129,0.04)' : 'rgba(201,168,76,0.03)',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onClick={() => document.getElementById('cert-pdf-input').click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file?.type === 'application/pdf') setPdfFile(file)
              }}
              >
                <input
                  id="cert-pdf-input"
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={e => setPdfFile(e.target.files[0] || null)}
                />
                {pdfFile ? (
                  <div>
                    <FaFilePdf style={{ fontSize: '2.5rem', color: '#6ee7b7', marginBottom: 8 }} />
                    <p style={{ color: '#6ee7b7', fontWeight: 600, marginBottom: 4 }}>{pdfFile.name}</p>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.8rem' }}>
                      {(pdfFile.size / 1024).toFixed(1)} KB — Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <FaFilePdf style={{ fontSize: '2.5rem', color: 'var(--gold-light)', marginBottom: 8, opacity: 0.5 }} />
                    <p style={{ color: 'var(--gray-400)', marginBottom: 4 }}>Drag & drop PDF here, or click to browse</p>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.78rem' }}>PDF only · Max 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {formError && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: '#fca5a5', fontSize: '0.85rem',
              }}>
                ⚠ {formError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-gold" disabled={saving} style={{ fontSize: '0.92rem', minWidth: 160 }}>
                {saving ? '⏳ Uploading...' : <><FaUpload /> Upload Certificate</>}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setFormError(''); setFormSuccess('') }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍  Search by name, enrollment no. or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '11px 16px',
            background: 'rgba(10,22,40,0.8)', border: '1.5px solid rgba(14,116,144,0.25)',
            borderRadius: 8, color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--teal-light)' }}>⏳ Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          border: '1px dashed rgba(14,116,144,0.3)', borderRadius: 16, color: 'var(--gray-400)',
        }}>
          {search ? `No results for "${search}"` : 'No certificates uploaded yet.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(14,116,144,0.1)' }}>
                {['Enrollment No.', 'Student Name', 'Phone (Admin)', 'Issue Date', 'Uploaded', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', color: 'var(--gray-400)',
                    fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                    borderBottom: '1px solid rgba(14,116,144,0.15)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((cert, i) => (
                <tr key={cert.$id} style={{
                  borderBottom: '1px solid rgba(14,116,144,0.08)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(14,116,144,0.03)',
                  transition: 'background 0.2s',
                }}>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontFamily: 'monospace', fontWeight: 700, color: 'var(--teal-light)',
                      fontSize: '0.9rem', letterSpacing: '0.05em',
                    }}>{cert.enrollmentNo}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--white)', fontWeight: 500 }}>{cert.studentName}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--gray-600)', fontSize: '0.82rem' }}>
                    {/* Partially mask phone for privacy */}
                    {cert.studentPhone
                      ? cert.studentPhone.slice(0, 3) + '•••••' + cert.studentPhone.slice(-2)
                      : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--gray-400)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--gray-600)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {new Date(cert.$createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a
                        href={String(getCertificateViewUrl(cert.fileId))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                        title="View PDF"
                      >
                        <FaEye /> View
                      </a>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(cert)}
                        disabled={deleteLoading === cert.$id}
                        style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                        title="Delete certificate"
                      >
                        {deleteLoading === cert.$id ? '...' : <><FaTrash /> Delete</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--gray-600)', textAlign: 'right' }}>
            Showing {filtered.length} of {certs.length} certificates
          </p>
        </div>
      )}
    </div>
  )
}
