import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'
import Problem from '../components/sections/Problem'
import Solution from '../components/sections/Solution'
import Features from '../components/sections/Features'
import HowItWorks from '../components/sections/HowItWorks'
import Progress from '../components/sections/Progress'
import Testimonials from '../components/sections/Testimonials'
import CTA from '../components/sections/CTA'

const LandingPage = () => {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <div className="retro-divider" />
                <section id="problem"><Problem /></section>
                <div className="retro-divider" />
                <section id="solution"><Solution /></section>
                <div className="retro-divider" />
                <section id="features"><Features /></section>
                <div className="retro-divider" />
                <section id="how-it-works"><HowItWorks /></section>
                <div className="retro-divider" />
                <section id="progress"><Progress /></section>
                <div className="retro-divider" />
                {/* <section id="testimonials"><Testimonials /></section> */}
                <div className="retro-divider" />
                <CTA />
            </main>
            <Footer />
        </>
    )
}

export default LandingPage
