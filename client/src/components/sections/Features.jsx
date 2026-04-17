import { features } from '../../constants/data'

const Features = () => {
    return (
        <section className="relative overflow-hidden bg-neutral-50 py-28 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16">
                    <div className="text-base font-bold tracking-widest text-accent uppercase mb-4">Features</div>
                    <h2 className="text-[clamp(36px,5vw,64px)] text-black">
                        Everything You Need to <span className="text-accent">Master Anything</span>
                    </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map(({ icon, title, desc }) => (
                        <div key={title} className="retro-card bg-white border-2 border-black/15 shadow-[4px_4px_0_rgba(0,0,0,0.08)] hover:border-black hover:shadow-[6px_6px_0_black] p-10 transition-all duration-200">
                            <div className="text-4xl mb-6 text-accent">{icon}</div>
                            <h3 className="text-2xl text-black mb-4">{title}</h3>
                            <p className="text-base text-black/50 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features
