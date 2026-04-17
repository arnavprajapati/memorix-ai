const CTA = () => {
    return (
        <section className="relative overflow-hidden bg-accent py-32 px-8 text-center">
            <div className="retro-grid absolute inset-0 opacity-20" />

            <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-[clamp(40px,6vw,72px)] text-black mb-6">
                    Start Learning Smarter Today
                </h2>

                <p className="text-xl text-black/60 leading-relaxed mb-12">
                    Upload your first PDF free. No credit card. No commitment.<br />
                    Just better memory — starting today.
                </p>

                <div className="flex gap-5 justify-center flex-wrap mb-10">
                    <button className="retro-btn bg-black text-white shadow-[6px_6px_0_rgba(0,0,0,0.3)] hover:shadow-[10px_10px_0_rgba(0,0,0,0.3)]">
                        Create Your First Deck →
                    </button>
                    <button className="retro-btn bg-white text-black shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0_black]">
                        Watch Demo
                    </button>
                </div>

                <div className="text-base text-black/50 flex gap-8 justify-center flex-wrap font-semibold">
                    <span>✓ Free forever plan</span>
                    <span>✓ No credit card</span>
                    <span>✓ Cancel anytime</span>
                </div>
            </div>
        </section>
    )
}

export default CTA
