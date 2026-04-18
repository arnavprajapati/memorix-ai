import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const DashboardPage = () => {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'

    return (
        <div className="relative min-h-screen bg-white">
            <div className="retro-grid absolute inset-0" />

            {/* Topbar */}
            <nav className="relative z-10 border-b-2 border-black bg-white px-8 h-20 flex items-center justify-between">
                <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Athletics, sans-serif' }}>
                    MEMORIX<span className="text-accent">.</span>
                </span>
                <div className="flex items-center gap-6">
                    <span className="text-base font-semibold text-black/50">{user?.email}</span>
                    <button
                        onClick={handleSignOut}
                        className="retro-btn bg-white text-black shadow-[3px_3px_0_black] hover:shadow-[6px_6px_0_black] text-sm px-5 py-2"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Main */}
            <div className="relative z-10 max-w-5xl mx-auto px-8 py-16">
                {/* Welcome */}
                <div className="mb-14">
                    <div className="inline-block mb-4 text-sm font-bold tracking-widest text-accent border-2 border-accent px-4 py-1 bg-accent-light uppercase">
                        Dashboard
                    </div>
                    <h1 className="text-[clamp(36px,5vw,64px)] text-black">
                        Welcome back, <span className="text-accent">{name}</span>
                    </h1>
                    <p className="text-lg text-black/40 mt-3">Ready to study? Your decks are waiting.</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-14">
                    {[
                        { val: '0', label: 'Cards Due' },
                        { val: '0', label: 'Cards Learned' },
                        { val: '1', label: 'Day Streak 🔥' },
                        { val: '0', label: 'Decks' },
                    ].map(({ val, label }) => (
                        <div key={label} className="border-2 border-black shadow-[4px_4px_0_black] bg-white p-6 text-center">
                            <div className="text-4xl font-extrabold text-accent" style={{ fontFamily: 'Athletics, sans-serif' }}>{val}</div>
                            <div className="text-sm text-black/50 font-semibold mt-2">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Create Deck CTA */}
                <div className="border-2 border-black shadow-[6px_6px_0_black] bg-accent-light p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl text-black mb-2">Create your first deck</h2>
                        <p className="text-base text-black/50">Upload a PDF or paste your notes to generate flashcards instantly.</p>
                    </div>
                    <button className="retro-btn bg-accent text-black shadow-[5px_5px_0_black] hover:shadow-[8px_8px_0_black] shrink-0">
                        + New Deck
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
