import { painPoints } from '../../constants/data'

const Problem = () => {
    return (
        <section className="relative overflow-hidden bg-neutral-50 py-28 px-8">
            <div className="retro-grid absolute inset-0" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-16">
                    <div className="text-base font-bold tracking-widest text-accent uppercase mb-4">The Problem</div>
                    <h2 className="text-[clamp(36px,5vw,64px)] text-black">
                        Why Students <span className="text-accent">Keep Forgetting</span>
                    </h2>
                    <p className="text-xl text-black/50 mt-5 max-w-xl">
                        Traditional study methods are broken. Here's what the data shows.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {painPoints.map(({ icon, title, desc }) => (
                        <div key={title} className="retro-card bg-white border-2 border-black shadow-[5px_5px_0_black] p-10">
                            <div className="text-5xl mb-6">{icon}</div>
                            <h3 className="text-2xl text-black mb-4">{title}</h3>
                            <p className="text-base text-black/50 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 bg-accent border-2 border-black shadow-[5px_5px_0_black] p-8 flex flex-wrap gap-6 items-center">
                    <div className="text-5xl font-bold text-black" style={{ fontFamily: 'Athletics, sans-serif' }}>70%</div>
                    <p className="text-xl text-black font-semibold max-w-lg">
                        of what you study is forgotten within 24 hours using traditional methods. Spaced repetition changes that.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Problem
