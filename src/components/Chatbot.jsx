import { useState, useEffect, useRef } from 'react'
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa'

// ─── Knowledge Base ────────────────────────────────────────────────────────────
const KB = [
  {
    patterns: ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good evening', 'good afternoon', 'helo', 'hii'],
    response: `Namaste! 🙏 Welcome to **Raj Institute of Medical Sciences (RIMS)**.\n\nI'm your RIMS assistant. I can help you with:\n• 📚 Courses & Admissions\n• 🩸 Blood Test Booking\n• 🏥 Diagnostic Packages\n• 📜 Certificates\n• 📍 Location & Contact\n\nWhat would you like to know?`,
  },
  {
    patterns: ['course', 'courses', 'admission', 'admissions', 'enroll', 'enrollment', 'join', 'study', 'programme', 'program'],
    response: `**RIMS offers the following courses:**\n\n🩺 **Paramedical (12th any stream)**\n• Medical Lab Technology\n• Optometry Technician\n• Operation Theatre\n• Cardiac Care Technology\n• Physiotherapy\n• Dialysis Technician\n• Radiology & Imaging Technology\n• E.M.T.\n• BNYS (PCB)\n\n📋 **Certificate (10th minimum)**\n• Dresser (Medical)\n• CMS & ED\n\n💻 **Computer Courses**\n• DCA, ADCA, PGDCA, TALLY, TYPING\n\n🎓 **UG Programs:** B.A., B.COM, B.SC\n\n🏛️ **PG Programs:** M.SC, MCA, MBA, M.LIB, MSW\n\nAll affiliated with UGC Approved Universities, GSDM & NSDM.`,
  },
  {
    patterns: ['paramedical', 'medical lab', 'optometry', 'operation theatre', 'cardiac', 'physiotherapy', 'dialysis', 'radiology', 'emt', 'bnys', 'nursing'],
    response: `**Paramedical Courses at RIMS** (Eligibility: 12th, Any Stream):\n\n• Medical Lab Technology\n• Optometry Technician\n• Operation Theatre\n• Cardiac Care Technology\n• Physiotherapy\n• Dialysis Technician\n• Radiology and Imaging Technology\n• E.M.T. (Emergency Medical Technician)\n• BNYS — Bachelor of Naturopathy & Yogic Sciences (PCB)\n\nAffiliated with UGC Approved Universities.\n\nFor admission details & fees, contact **Dr. Pankaj Kumar** at **+91 74885 37035**.`,
  },
  {
    patterns: ['computer course', 'dca', 'adca', 'pgdca', 'tally', 'typing', 'computer', 'it course'],
    response: `**Computer Courses at RIMS:**\n\n💻 DCA — Diploma in Computer Applications\n💻 ADCA — Advanced Diploma in Computer Applications\n💻 PGDCA — Post Graduate Diploma in Computer Applications\n💻 TALLY — Accounting & GST Software\n💻 TYPING — Hindi / English\n\nAffordable fee structure. All courses are certificate/diploma level.\n\nFor admission, contact **Dr. Pankaj Kumar** at **+91 74885 37035**.`,
  },
  {
    patterns: ['ug', 'undergraduate', 'ba', 'b.a', 'bcom', 'b.com', 'bsc', 'b.sc', 'bachelor'],
    response: `**Undergraduate (UG) Programs at RIMS:**\n\n🎓 B.A. — Bachelor of Arts\n🎓 B.COM — Bachelor of Commerce\n🎓 B.SC — Bachelor of Science\n\nEligibility: 12th pass from any recognized board.\nAll UG programs are affiliated with UGC Approved Universities.\n\nFor details, contact **+91 74885 37035**.`,
  },
  {
    patterns: ['pg', 'postgraduate', 'post graduate', 'msc', 'm.sc', 'mca', 'mba', 'mlib', 'm.lib', 'msw', 'master'],
    response: `**Postgraduate (PG) Programs at RIMS:**\n\n🏛️ M.SC — Master of Science\n🏛️ MCA — Master of Computer Applications\n🏛️ MBA — Master of Business Administration\n🏛️ M.LIB — Master of Library Science\n🏛️ MSW — Master of Social Work\n\nAll affiliated with UGC Approved Universities.\n\nFor fee structure & admission, call **+91 74885 37035**.`,
  },
  {
    patterns: ['dresser', 'cms', 'cms ed', 'cms & ed', 'certificate course', '10th', 'tenth'],
    response: `**Certificate Courses at RIMS** (Eligibility: 10th Minimum):\n\n📋 Dresser (Medical)\n📋 CMS & ED — Community Medical Services & Essential Drugs\n\nThese short-term courses are ideal for students who want to enter the medical field quickly.\n\nContact **Dr. Pankaj Kumar** at **+91 74885 37035** for admission.`,
  },
  {
    patterns: ['blood test', 'blood', 'test', 'book blood', 'blood booking', 'book test', 'blood checkup'],
    response: `**Blood Test Services at RIMS:**\n\n🩸 We offer home-visit blood collection & lab testing.\n\n**Tests Available:**\n• Complete Blood Count (CBC)\n• Biochemistry (LFT, KFT, Lipid Profile)\n• Hormone Tests (Thyroid, Diabetes)\n• Pathology (Urine, Stool)\n• Cardiac Markers (Troponin, CK-MB)\n• Infection Screening (Dengue, Malaria, Typhoid)\n\n📌 **To Book:** Click the "Book Now" button in the Blood Test section — no login required!\n\nOr call **+91 74885 37035** directly.`,
  },
  {
    patterns: ['full body', 'body checkup', 'full checkup', 'urine test', 'blood urine', 'checkup'],
    response: `**Full Body Checkup at RIMS:**\n\n✅ यहाँ Full Body Checkup — Blood & Urine द्वारा होता हैं।\n\nOur clinic offers comprehensive full-body diagnostics including blood tests and urine analysis on-site.\n\n**📍 Location:** Raj Vakhalaya, Station Road, Kundwa, East Champaran, Bihar — 845304\n\n**📞 Book Appointment:** +91 74885 37035`,
  },
  {
    patterns: ['package', 'packages', 'health package', 'diagnostic package', 'checkup package'],
    response: `**Diagnostic Packages at RIMS:**\n\nWe offer comprehensive health checkup packages at affordable prices. Packages are listed in the **Packages section** of this website.\n\n🧪 Each package includes multiple tests bundled together for better value.\n\nYou can:\n• Browse packages on the website\n• Click "Book This Package" to request one\n\nFor custom packages or pricing, contact **Dr. Pankaj Kumar** at **+91 74885 37035**.`,
  },
  {
    patterns: ['certificate', 'my certificate', 'download certificate', 'get certificate', 'verify certificate', 'enrollment', 'marksheet'],
    response: `**Certificate Download at RIMS:**\n\n📜 Students can download their official certificates from the **Certificate section** of this website.\n\n**Steps:**\n1. Go to the Certificate section\n2. Click "Get Certificate"\n3. Solve the security CAPTCHA\n4. Enter your **Full Name** + **Enrollment Number**\n5. Your certificate will be verified and ready to download as PDF!\n\nIf you face any issues, contact **Dr. Pankaj Kumar** at **+91 74885 37035** or email **pankajosank1994@gmail.com**.`,
  },
  {
    patterns: ['fee', 'fees', 'cost', 'price', 'charges', 'how much', 'kitna', 'tuition'],
    response: `**Fee Structure:**\n\nFee details vary by course and are updated regularly.\n\nFor accurate and latest fee information, please contact us directly:\n\n📞 **+91 74885 37035**\n📧 **pankajosank1994@gmail.com**\n\nOr visit us at:\n📍 Raj Vakhalaya, Station Road, Kundwa, East Champaran, Bihar — 845304`,
  },
  {
    patterns: ['address', 'location', 'where', 'kahan', 'place', 'how to reach', 'directions', 'map'],
    response: `**RIMS Location:**\n\n📍 Raj Vakhalaya, Station Road, Kundwa,\nChelpur Landmark, Post Office — Railway Station,\nEast Champaran, Bihar — 845304\n\n🗺️ You can find us on Google Maps by searching **"RIMS East Champaran"**.\n\n**Nearest Landmark:** Railway Station, East Champaran\n\n📞 Call for directions: **+91 74885 37035**`,
  },
  {
    patterns: ['contact', 'phone', 'call', 'mobile', 'number', 'reach', 'email', 'gmail'],
    response: `**Contact RIMS:**\n\n📞 **Phone/Mobile:** +91 74885 37035\n📧 **Email:** pankajosank1994@gmail.com\n\n👨‍⚕️ **Founder & Director:**\nDr. Pankaj Kumar\nXpress Cure E-Clinic (Reg. xc4049543)\n\n⏰ **Working Hours:**\n• Mon–Sat: 8:00 AM – 8:00 PM\n• Sunday: 9:00 AM – 2:00 PM\n• Emergency: 24/7`,
  },
  {
    patterns: ['dr pankaj', 'doctor pankaj', 'pankaj kumar', 'founder', 'director', 'principal'],
    response: `**Dr. Pankaj Kumar** is the Founder & Director of Raj Institute of Medical Sciences.\n\n👨‍⚕️ He also runs **Xpress Cure E-Clinic** (Reg. xc4049543).\n\n📞 **Direct Contact:** +91 74885 37035\n📧 **Email:** pankajosank1994@gmail.com\n\n📍 Raj Vakhalaya, Station Road, Kundwa, East Champaran, Bihar — 845304`,
  },
  {
    patterns: ['affiliation', 'affiliated', 'ugc', 'university', 'recognised', 'recognized', 'approved', 'gsdm', 'nsdm'],
    response: `**RIMS Affiliations:**\n\n✅ Affiliated with **UGC Approved Universities**\n✅ Affiliated with **GSDM** (Government Skill Development Mission)\n✅ Affiliated with **NSDM** (National Skill Development Mission)\n\nAll courses and degrees awarded by RIMS are recognized under these bodies, ensuring your qualification is valid and respected nationwide.`,
  },
  {
    patterns: ['timing', 'time', 'hours', 'open', 'close', 'when'],
    response: `**RIMS Working Hours:**\n\n🗓️ Monday – Saturday: **8:00 AM – 8:00 PM**\n🗓️ Sunday: **9:00 AM – 2:00 PM**\n🩸 Blood & Urine Checkup: **Daily**\n🚨 Emergency / E-Clinic: **24/7**\n\nFor urgent queries, call **+91 74885 37035** anytime.`,
  },
  {
    patterns: ['feedback', 'review', 'rating', 'testimonial', 'complaint'],
    response: `**Share Your Feedback:**\n\nWe value your experience at RIMS! You can:\n\n⭐ Leave a star rating and review in the **Feedback section** on this website.\n\nFor complaints or urgent concerns, please directly contact:\n📞 **Dr. Pankaj Kumar — +91 74885 37035**\n📧 **pankajosank1994@gmail.com**`,
  },
  {
    patterns: ['rims', 'institute', 'about', 'raj institute', 'who are you', 'what is rims', 'about rims'],
    response: `**About Raj Institute of Medical Sciences (RIMS):**\n\n🏫 A premier college for Computer, Paramedical, Nursing & Pharmacy education in East Champaran, Bihar.\n\n**मैंडिकाल क्षेत्र में अपना सपना साकार करें**\n*(Realize your dream in the medical field)*\n\n✅ 20+ Courses Offered\n✅ UGC Approved Universities\n✅ On-site Blood & Urine Diagnostics\n✅ Certificate Download Portal\n\n**Founder:** Dr. Pankaj Kumar\n📞 +91 74885 37035`,
  },
  {
    patterns: ['eligibility', 'qualification', 'criteria', 'who can apply', 'can i apply', 'requirement', '12th', 'twelfth'],
    response: `**Eligibility Criteria at RIMS:**\n\n📋 **10th Pass (Minimum):** Dresser (Medical), CMS & ED, and Computer courses\n\n📚 **12th Pass (Any Stream):** All Paramedical courses — Medical Lab Technology, Optometry, Cardiac Care, Physiotherapy, Dialysis, Radiology, BNYS, E.M.T., Operation Theatre\n\n🎓 **12th Pass:** UG Programs — B.A., B.COM, B.SC\n\n🏛️ **Graduation Required:** PG Programs — MBA, MCA, M.SC, M.LIB, MSW\n\nFor specific eligibility queries, call **+91 74885 37035**.`,
  },
  {
    patterns: ['bye', 'goodbye', 'thank you', 'thanks', 'ok', 'okay', 'done', 'nothing', 'that is all', "that's all"],
    response: `Thank you for contacting RIMS! 🙏\n\nIf you have more questions anytime, feel free to ask.\n\nFor any other assistance:\n📞 **+91 74885 37035**\n📧 **pankajosank1994@gmail.com**\n\nWishing you good health! 💚`,
  },
]

// ─── Fallback ─────────────────────────────────────────────────────────────────
const FALLBACK = `I'm sorry, I couldn't find specific information about that. 🙏\n\nFor detailed assistance, please contact:\n\n👨‍⚕️ **Dr. Pankaj Kumar**\n📞 **+91 74885 37035**\n📧 **pankajosank1994@gmail.com**\n\n📍 Raj Vakhalaya, Station Road, Kundwa, East Champaran, Bihar — 845304\n\nOur team will be happy to help you!`

function getBotResponse(input) {
  const text = input.toLowerCase().trim()
  for (const item of KB) {
    if (item.patterns.some(p => text.includes(p))) {
      return item.response
    }
  }
  return FALLBACK
}

// ─── Message renderer (supports **bold** and \n) ─────────────────────────────
function MessageText({ text }) {
  return (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: '0.88rem' }}>
      {text.split('\n').map((line, li) => (
        <p key={li} style={{ margin: li === 0 ? 0 : '3px 0 0' }}>
          {line.split(/(\*\*[^*]+\*\*)/).map((seg, si) =>
            seg.startsWith('**') && seg.endsWith('**')
              ? <strong key={si} style={{ color: 'var(--white)' }}>{seg.slice(2, -2)}</strong>
              : seg
          )}
        </p>
      ))}
    </div>
  )
}

// ─── Quick Replies ─────────────────────────────────────────────────────────────
const QUICK = [
  '📚 Courses', '🩸 Blood Test', '📍 Location',
  '📞 Contact', '📜 Certificate', '💰 Fees',
]

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Namaste! 🙏 I'm the RIMS Assistant.\n\nHow can I help you today? You can ask about courses, blood tests, fees, location, certificates, and more!`,
      time: now(),
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [pulse, setPulse] = useState(true)
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
      inputRef.current?.focus()
    }
  }, [open, messages])

  // Pulse notification after 3s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000)
    return () => clearTimeout(t)
  }, [])

  const send = (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return
    setInput('')

    setMessages(m => [...m, { from: 'user', text: userMsg, time: now() }])
    setTyping(true)

    const delay = 700 + Math.random() * 500
    setTimeout(() => {
      setTyping(false)
      setMessages(m => [...m, { from: 'bot', text: getBotResponse(userMsg), time: now() }])
    }, delay)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating Button */}
      <div style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 999,
      }}>
        {!open && pulse && (
          <div style={{
            position: 'absolute', top: -36, right: 0, whiteSpace: 'nowrap',
            background: 'rgba(15,32,68,0.95)', border: '1px solid rgba(14,116,144,0.4)',
            borderRadius: 20, padding: '6px 14px', fontSize: '0.78rem', color: 'var(--teal-light)',
            animation: 'fadeIn 0.4s ease',
          }}>
            💬 Ask RIMS Assistant
          </div>
        )}
        <button
          onClick={() => { setOpen(!open); setPulse(false) }}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: open ? 'rgba(239,68,68,0.85)' : 'linear-gradient(135deg, var(--teal), #22d3ee)',
            border: 'none', cursor: 'pointer', color: 'white',
            fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(14,116,144,0.45)',
            transition: 'all 0.3s ease',
            animation: !open ? 'chatPulse 3s ease-in-out infinite' : 'none',
          }}
          title={open ? 'Close chat' : 'Chat with RIMS Assistant'}
        >
          {open ? <FaTimes /> : <FaComments />}
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window" style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 998,
          width: 360, maxHeight: 580,
          background: 'rgba(10,22,40,0.97)',
          border: '1px solid rgba(14,116,144,0.3)',
          borderRadius: 20,
          boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.3s ease',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(14,116,144,0.3), rgba(14,116,144,0.1))',
            borderBottom: '1px solid rgba(14,116,144,0.2)',
            borderRadius: '20px 20px 0 0',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--teal), #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>
              <FaRobot style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--white)' }}>RIMS Assistant</div>
              <div style={{ fontSize: '0.72rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'blink 2s ease-in-out infinite' }} />
                Online — Ready to help
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: 'var(--gray-400)',
              cursor: 'pointer', fontSize: '1rem', padding: 4,
            }}><FaTimes /></button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: 12,
            maxHeight: 360,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 8,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: msg.from === 'bot'
                    ? 'linear-gradient(135deg, var(--teal), #22d3ee)'
                    : 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem',
                }}>
                  {msg.from === 'bot' ? <FaRobot style={{ color: 'white', fontSize: '0.7rem' }} /> : <FaUser style={{ color: 'var(--navy)', fontSize: '0.7rem' }} />}
                </div>
                {/* Bubble */}
                <div style={{
                  maxWidth: '78%',
                  background: msg.from === 'bot'
                    ? 'rgba(15,32,68,0.9)'
                    : 'linear-gradient(135deg, var(--teal), #0891b2)',
                  border: msg.from === 'bot' ? '1px solid rgba(14,116,144,0.25)' : 'none',
                  borderRadius: msg.from === 'bot' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  padding: '10px 14px',
                  color: msg.from === 'bot' ? 'var(--gray-400)' : 'white',
                }}>
                  <MessageText text={msg.text} />
                  <div style={{ fontSize: '0.65rem', color: msg.from === 'bot' ? 'var(--gray-600)' : 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'right' }}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaRobot style={{ color: 'white', fontSize: '0.7rem' }} />
                </div>
                <div style={{
                  background: 'rgba(15,32,68,0.9)', border: '1px solid rgba(14,116,144,0.25)',
                  borderRadius: '16px 16px 16px 4px', padding: '12px 16px',
                  display: 'flex', gap: 5, alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', background: 'var(--teal-light)',
                      animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(14,116,144,0.15)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)} style={{
                  padding: '4px 11px', borderRadius: 20, border: '1px solid rgba(14,116,144,0.35)',
                  background: 'rgba(14,116,144,0.1)', color: 'var(--teal-light)',
                  fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.target.style.background = 'rgba(14,116,144,0.25)'}
                onMouseLeave={e => e.target.style.background = 'rgba(14,116,144,0.1)'}
                >{q}</button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(14,116,144,0.15)',
            borderRadius: '0 0 20px 20px',
            display: 'flex', gap: 8, alignItems: 'flex-end',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your question..."
              rows={1}
              style={{
                flex: 1, background: 'rgba(10,22,40,0.8)',
                border: '1.5px solid rgba(14,116,144,0.25)', borderRadius: 12,
                padding: '9px 13px', color: 'var(--white)', fontSize: '0.88rem',
                fontFamily: 'var(--font-body)', resize: 'none', outline: 'none',
                maxHeight: 80, transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'rgba(14,116,144,0.25)'}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none',
                background: input.trim() ? 'linear-gradient(135deg, var(--teal), #22d3ee)' : 'rgba(14,116,144,0.2)',
                color: 'white', cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', flexShrink: 0, transition: 'all 0.2s',
              }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 6px 24px rgba(14,116,144,0.45); }
          50% { box-shadow: 0 6px 32px rgba(14,116,144,0.75), 0 0 0 8px rgba(14,116,144,0.12); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 420px) {
          /* chatbot window */
        }
      `}</style>
    </>
  )
}

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
