import ProgressBar from '../ui/ProgressBar'
import { progressTopics } from '../../constants/data'

const Progress = () => {
    return (
        <section className="relative overflow-hidden bg-neutral-50 py-28 px-8">
            <div className="retro-grid absolute inset-0" />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-16">
                    <div className="text-base font-bold tracking-widest text-accent uppercase mb-4">Progress</div>
                    <h2 className="text-[clamp(36px,5vw,64px)] text-black">
                        Watch Your <span className="text-accent">Mastery Grow</span>
                    </h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div className="bg-white border-2 border-black shadow-[5px_5px_0_black] p-10">
                        <div className="text-lg font-bold text-black mb-8">Topic Mastery — BIO101</div>
                        {progressTopics.map(t => <ProgressBar key={t.name} {...t} />)}
                    </div>

                    <div className="flex flex-col gap-5">
                        <div className="bg-accent border-2 border-black shadow-[5px_5px_0_black] px-10 py-8 flex items-center justify-between">
                            <div>
                                <div className="text-base font-bold text-black/70 mb-2 uppercase tracking-widest">Daily Streak</div>
                                <div className="text-7xl font-bold text-black" style={{ fontFamily: 'Athletics, sans-serif' }}>7</div>
                                <div className="text-base text-black/60 mt-1">days in a row</div>
                            </div>
                            <div className="text-6xl">🔥</div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0_black] p-8 text-center">
                                <div className="text-5xl font-bold text-accent mb-2" style={{ fontFamily: 'Athletics, sans-serif' }}>248</div>
                                <div className="text-base text-black/40">Cards Reviewed</div>
                            </div>
                            <div className="bg-white border-2 border-black shadow-[4px_4px_0_black] p-8 text-center">
                                <div className="text-5xl font-bold text-accent mb-2" style={{ fontFamily: 'Athletics, sans-serif' }}>73%</div>
                                <div className="text-base text-black/40">Overall Mastery</div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-black shadow-[4px_4px_0_black] px-8 py-6">
                            <div className="text-base font-bold text-black mb-4">⚠ Needs Review</div>
                            {['History: WWI', 'Organic Chemistry'].map(t => (
                                <div key={t} className="text-base text-black/50 py-3 border-b border-black/5 flex justify-between">
                                    <span>{t}</span>
                                    <span className="text-accent font-bold">Review →</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Progress
