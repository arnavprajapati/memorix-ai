const ProgressBar = ({ name, pct }) => (
    <div className="mb-6">
        <div className="flex justify-between mb-2">
            <span className="text-base font-semibold text-black/60">{name}</span>
            <span className="text-base font-bold text-accent">{pct}%</span>
        </div>
        <div className="h-3 bg-black/5 border border-black/10">
            <div className="h-full bg-accent transition-all duration-[1.5s]" style={{ width: pct + '%' }} />
        </div>
    </div>
)

export default ProgressBar
