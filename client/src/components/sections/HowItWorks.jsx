import { howItWorksSteps } from '../../constants/data'

const HowItWorks = () => {
    return (
        <section className="relative bg-white py-28 px-8">
            <div className="retro-grid absolute inset-0" />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-16">
                    <div className="text-base font-bold tracking-widest text-accent uppercase mb-4">How It Works</div>
                    <h2 className="text-[clamp(36px,5vw,64px)] text-black">
                        Four Steps to <span className="text-accent">Total Mastery</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {howItWorksSteps.map(({ num, icon, title, detail }) => (
                        <div key={num} className="retro-card bg-accent-light border-2 border-black shadow-[5px_5px_0_black] p-10 flex gap-8 items-start">
                            <div className="text-6xl font-bold text-black/10 shrink-0 leading-none" style={{ fontFamily: 'Athletics, sans-serif' }}>{num}</div>
                            <div>
                                <div className="text-4xl mb-4">{icon}</div>
                                <h3 className="text-2xl text-black mb-3">{title}</h3>
                                <p className="text-base text-black/50 leading-relaxed">{detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorks
