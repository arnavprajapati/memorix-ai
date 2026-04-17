import StarRating from '../ui/StarRating'
import { testimonials, socialProof } from '../../constants/data'

const Testimonials = () => {
    return (
        <section className="relative overflow-hidden bg-white py-28 px-8">
            <div className="retro-grid absolute inset-0" />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-16">
                    <div className="text-base font-bold tracking-widest text-accent uppercase mb-4">Testimonials</div>
                    <h2 className="text-[clamp(36px,5vw,64px)] text-black">
                        Students Who <span className="text-accent">Actually Remember</span>
                    </h2>
                    <p className="text-xl text-black/50 mt-5">Real results from real students.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    {testimonials.map(({ name, role, text, rating, avatar, streak }) => (
                        <div key={name} className="retro-card bg-accent-light border-2 border-black/15 hover:border-black shadow-[5px_5px_0_rgba(0,0,0,0.08)] hover:shadow-[7px_7px_0_black] p-10 transition-all duration-200">
                            <StarRating count={rating} />
                            <p className="text-lg text-black/60 leading-relaxed mb-8">"{text}"</p>
                            <div className="flex items-center gap-4 border-t border-black/10 pt-6">
                                <div className="w-12 h-12 border-2 border-black flex items-center justify-center text-2xl bg-white">{avatar}</div>
                                <div>
                                    <div className="text-lg font-bold text-black">{name}</div>
                                    <div className="text-base text-black/40">{role}</div>
                                </div>
                                <div className="ml-auto text-base font-bold text-accent">{streak} 🔥</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-14 flex flex-wrap gap-5 justify-center">
                    {socialProof.map(({ val, label }) => (
                        <div key={label} className="border-2 border-black px-10 py-6 bg-white shadow-[4px_4px_0_black] text-center flex-1 min-w-40">
                            <div className="text-4xl font-bold text-accent mb-1" style={{ fontFamily: 'Athletics, sans-serif' }}>{val}</div>
                            <div className="text-base text-black/40">{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Testimonials
