import Navbar from './Navbar'
import Hero from './Hero'
import BloodTest from './BloodTest'
import Packages from './Packages'
import Courses from './Courses'
import Admission from './Admission'
import Certificate from './Certificate'
import Feedback from './Feedback'
import Gallery from './Gallery'
import Contact from './Contact'
import Footer from './Footer'
import Chatbot from './Chatbot'

export default function Home() {
  return (
    <>
      <div className="ambient-bg"><div className="orb-3" /></div>
      <Navbar />
      <Hero />
      <BloodTest />
      <Packages />
      <Courses />
      <Admission />
      <Certificate />
      <Gallery />
      <Feedback />
      <Contact />
      <Footer />
      <Chatbot />
    </>
  )
}
