import { solutionSteps } from '../../constants/data'

const Solution = () => {
    return (
        <section className="relative bg-white py-28 px-8">
            <div className="retro-grid absolute inset-0" />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-16">
                    <div className="text-base font-bold tracking-widest text-accent uppercase mb-4">The Solution</div>
                    <h2 className="text-[clamp(36px,5vw,64px)] text-black">
                        How <span className="text-accent">Memorix</span> Fixes It
                    </h2>
                    <p className="text-xl text-black/50 mt-5 max-w-xl">
                        A complete system that turns passive reading into active, permanent memory.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {solutionSteps.map(({ num, icon, title, desc }, i) => (
                        <div key={num} className="relative">
                            {i < solutionSteps.length - 1 && (
                                <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-accent/50" />
                            )}
                            <div className="retro-card bg-white border-2 border-black shadow-[5px_5px_0_black] p-10 h-full">
                                <div className="text-7xl font-bold text-black/5 mb-2" style={{ fontFamily: 'Athletics, sans-serif' }}>{num}</div>
                                <div className="w-16 h-16 border-2 border-black flex items-center justify-center text-3xl mb-6 bg-accent-light">{icon}</div>
                                <h3 className="text-2xl text-black mb-4">{title}</h3>
                                <p className="text-base text-black/50 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-14 p-10 bg-accent-light border-2 border-black shadow-[5px_5px_0_black] flex flex-wrap gap-12 items-center justify-center">
                    {[
                        { val: '24', label: 'Cards Generated' },
                        { val: '8.2s', label: 'Processing Time' },
                        { val: '89%', label: 'Retention Rate' },
                    ].map(({ val, label }) => (
                        <div key={label} className="text-center">
                            <div className="text-5xl font-bold text-accent" style={{ fontFamily: 'Athletics, sans-serif' }}>{val}</div>
                            <div className="text-base text-black/40 mt-2">{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Solution
