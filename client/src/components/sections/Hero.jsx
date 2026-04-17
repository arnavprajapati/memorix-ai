import FlashCard from '../ui/FlashCard'
import { heroStats } from '../../constants/data'

const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-white min-h-screen flex items-start pt-10 lg:pt-20">
            <div className="retro-grid absolute inset-0" />

            <div className="w-full max-w-7xl mx-auto px-8 pt-2 pb-8 relative z-10 grid lg:grid-cols-2 gap-20 items-start">
                {/* LEFT */}
                <div className="slide-up">
                    <div className="inline-block mb-6 text-sm font-bold tracking-widest text-accent border-2 border-accent px-4 py-2 bg-accent-light uppercase">
                        AI-Powered Spaced Repetition
                    </div>

                    <h1 className="text-[clamp(48px,5vw,88px)] text-black mb-2">
                        Turn Your Notes<br />
                        <span className="text-accent">into Memory</span>
                    </h1>

                    <p className="text-xl text-black/50 max-w-lg mb-8 leading-relaxed">
                        Upload any PDF and get smart flashcards powered by AI and
                        spaced repetition. Study smarter. Remember longer.
                    </p>

                    <div className="flex flex-wrap gap-4 mb-10">
                        <button className="retro-btn bg-accent text-black shadow-[5px_5px_0_black] hover:shadow-[9px_9px_0_black]">
                            Get Started →
                        </button>
                        <button className="retro-btn bg-white text-black shadow-[5px_5px_0_black] hover:shadow-[9px_9px_0_black]">
                            ▶ See How
                        </button>
                    </div>

                    <div className="flex gap-12 border-t-2 border-black/10 pt-8">
                        {heroStats.map(({ val, label }) => (
                            <div key={label}>
                                <div className="text-4xl font-bold text-accent" style={{ fontFamily: 'Athletics, sans-serif' }}>{val}</div>
                                <div className="text-base text-black/40 mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT — Flashcard Stack */}
                <div className="flex justify-center items-start mt-24">
                    <div className="floating relative w-80 h-72">
                        <div className="absolute top-6 left-8 z-10 rotate-6">
                            <FlashCard tag="CARD 02 / 24" question="What is Active Recall?" back="Review answer →" />
                        </div>
                        <div className="absolute top-0 left-0 z-20 -rotate-2">
                            <FlashCard tag="CARD 01 / 24" question="What is Spaced Repetition?" back="Flip to reveal" />
                        </div>
                        <div className="absolute bottom-0 -right-17 z-30 bg-accent border-2 border-black shadow-[6px_6px_0_black] px-8 py-7 text-center">
                            <div className="text-lg font-bold text-black tracking-widest">STREAK</div>
                            <div className="text-5xl font-extrabold text-black mt-2 flex items-center justify-center gap-2">7 <span className="text-5xl">🔥</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
