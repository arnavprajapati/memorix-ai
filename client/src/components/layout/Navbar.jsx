import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { navLinks } from '../../constants/data'

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Map navLinks to section IDs
    const linkToId = {
        Features: 'features',
        'How It Works': 'how-it-works',
        Progress: 'progress',
        Problem: 'problem',
    }

    // Smooth scroll handler
    const handleNavClick = (e, id) => {
        e.preventDefault()
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
            setMenuOpen(false)
        }
    }

    return (
        <nav className={`sticky top-0 z-50 border-b-2 border-black bg-white transition-all duration-300 ${scrolled ? 'shadow-[0_4px_24px_rgba(0,0,0,0.08)]' : ''}`}>
            <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-20">
                <Link to="/" className="text-2xl font-bold tracking-tight no-underline text-black" style={{ fontFamily: 'Athletics, sans-serif' }}>
                    MEMORIX<span className="text-accent">.</span>
                </Link>

                <div className="hidden md:flex items-center gap-10 text-base font-semibold">
                    {navLinks.map(label => (
                        <a
                            key={label}
                            href={`#${linkToId[label]}`}
                            onClick={e => handleNavClick(e, linkToId[label])}
                            className="text-black/50 hover:text-black transition-colors no-underline"
                        >
                            {label}
                        </a>
                    ))}
                </div>

                <Link to="/signup" className="retro-btn hidden md:flex bg-accent text-black shadow-[4px_4px_0_black] hover:shadow-[7px_7px_0_black]">
                    Start Free
                </Link>

                <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden bg-transparent border-none text-2xl cursor-pointer">
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {menuOpen && (
                <div className="md:hidden border-t-2 border-black/10 px-8 py-6 flex flex-col gap-5 bg-white">
                    {navLinks.map(l => (
                        <a
                            key={l}
                            href={`#${linkToId[l]}`}
                            onClick={e => handleNavClick(e, linkToId[l])}
                            className="text-black/60 no-underline text-lg font-semibold hover:text-black transition-colors"
                        >
                            {l}
                        </a>
                    ))}
                    <Link to="/signup" className="retro-btn self-start mt-2 bg-accent text-black shadow-[3px_3px_0_black]">
                        Start Free
                    </Link>
                </div>
            )}
        </nav>
    )
}

export default Navbar
