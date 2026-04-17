import { footerLinks } from '../../constants/data'

const Footer = () => {
    return (
        <footer className="bg-black border-t-4 border-accent px-8 pt-20 pb-10">
            <div className="max-w-7xl mx-auto">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div>
                        <div className="text-3xl font-bold text-accent mb-5" style={{ fontFamily: 'Athletics, sans-serif' }}>
                            MEMORIX<span className="text-white">.</span>
                        </div>
                        <p className="text-base text-white/40 leading-relaxed max-w-56">
                            AI-powered flashcard learning. Turn any PDF into a structured study system.
                        </p>
                    </div>

                    {Object.entries(footerLinks).map(([section, items]) => (
                        <div key={section}>
                            <div className="text-base font-bold text-accent mb-5 uppercase tracking-widest">{section}</div>
                            <ul className="list-none p-0 m-0 flex flex-col gap-3">
                                {items.map(item => (
                                    <li key={item}>
                                        <a href="#" className="text-base text-white/40 no-underline hover:text-accent transition-colors">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="retro-divider mb-8" />

                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div className="text-base text-white/30">
                        © {new Date().getFullYear()} Memorix Inc. Built with spaced repetition.
                    </div>
                    <div className="text-base text-accent/50 font-bold">
                        ALL SYSTEMS ONLINE ◉
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
