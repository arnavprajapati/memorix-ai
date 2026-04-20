import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getUserDecks, getDueCards, getStreak } from '../services/api'

const DashboardPage = () => {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const [decks, setDecks] = useState([])
    const [dueCards, setDueCards] = useState([])
    const [streak, setStreak] = useState(0)
    const [loading, setLoading] = useState(true)

    const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student'

    useEffect(() => {
        if (!user?.id) return
        const load = async () => {
            try {
                const [d, due, streakData] = await Promise.all([
                    getUserDecks(user.id),
                    getDueCards(user.id),
                    getStreak(user.id),
                ])
                setDecks(d)
                setDueCards(due)
                setStreak(streakData.streak ?? 0)
            } catch (err) {
                console.error('[DashboardPage]', err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user?.id])

    const learnedCount = useMemo(
        () => dueCards.filter(c => c.repetitions > 0).length,
        [dueCards]
    )

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    // Due count per deck
    const dueByDeck = useMemo(() => {
        const map = {}
        dueCards.forEach(c => {
            map[c.deck_id] = (map[c.deck_id] || 0) + 1
        })
        return map
    }, [dueCards])

    const stats = [
        { val: dueCards.length, label: 'Cards Due' },
        { val: learnedCount, label: 'Cards Learned' },
        { val: `🔥 ${streak}`, label: 'Day Streak' },
        { val: decks.length, label: 'Decks' },
    ]

    return (
        <div className="relative min-h-screen bg-white">
            <div className="retro-grid absolute inset-0" />

            {/* Topbar */}
            <nav className="sticky top-0 z-30 border-b-2 border-black bg-white px-8 h-20 flex items-center justify-between">
                <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Athletics, sans-serif' }}>
                    MEMORIX<span style={{ color: '#F5C518' }}>.</span>
                </span>
                <div className="flex items-center gap-6">
                    <span className="text-sm font-semibold text-black/50 hidden sm:block">{user?.email}</span>
                    <button
                        onClick={handleSignOut}
                        className="retro-btn bg-white text-black border-2 border-black shadow-[3px_3px_0_black] hover:shadow-[6px_6px_0_black] text-sm px-5 py-2 font-bold"
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Main */}
            <div className="relative z-10 max-w-5xl mx-auto px-8 py-16">

                {/* Welcome */}
                <div className="mb-12">
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
                    {stats.map(({ val, label }) => (
                        <div key={label} className="border-2 border-black shadow-[4px_4px_0_black] bg-white p-6 text-center">
                            <div
                                className="text-4xl font-extrabold text-accent"
                                style={{ fontFamily: 'Athletics, sans-serif' }}
                            >
                                {loading ? <span className="animate-pulse text-black/20">—</span> : val}
                            </div>
                            <div className="text-sm text-black/50 font-semibold mt-2">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Decks Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-extrabold text-black" style={{ fontFamily: 'Athletics, sans-serif' }}>
                            Your Decks
                        </h2>
                        <Link
                            to="/new-deck"
                            className="retro-btn bg-accent text-black border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] text-sm px-5 py-2.5 font-bold"
                        >
                            + New Deck
                        </Link>
                    </div>

                    {loading ? (
                        // Skeleton
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="border-2 border-black/10 p-6 animate-pulse bg-black/5 h-36" />
                            ))}
                        </div>
                    ) : decks.length === 0 ? (
                        // Empty state
                        <div className="border-2 border-black shadow-[6px_6px_0_black] bg-accent-light p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-3xl text-black mb-2">Create your first deck</h2>
                                <p className="text-base text-black/50">Upload a PDF or paste your notes to generate flashcards instantly.</p>
                            </div>
                            <Link
                                to="/new-deck"
                                className="retro-btn bg-accent text-black border-2 border-black shadow-[5px_5px_0_black] hover:shadow-[8px_8px_0_black] shrink-0 px-6 py-3 font-bold"
                            >
                                + New Deck
                            </Link>
                        </div>
                    ) : (
                        // Deck grid
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {decks.map(deck => {
                                const due = dueByDeck[deck.id] || 0
                                return (
                                    <div
                                        key={deck.id}
                                        onClick={() => navigate(`/deck/${deck.id}`)}
                                        className="border-2 border-black bg-white shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] p-6 cursor-pointer transition-shadow flex flex-col gap-3"
                                    >
                                        <div>
                                            <h3 className="text-xl font-extrabold text-black leading-tight" style={{ fontFamily: 'Athletics, sans-serif' }}>
                                                {deck.name}
                                            </h3>
                                            {deck.description && (
                                                <p className="text-sm text-black/40 mt-1 truncate">{deck.description}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/10">
                                            <span className="text-sm text-black/40 font-medium">
                                                {deck.card_count ?? 0} cards
                                                {' • '}
                                                <span className={due > 0 ? 'text-accent font-bold' : ''}>
                                                    {due} due
                                                </span>
                                            </span>
                                            <button
                                                onClick={e => { e.stopPropagation(); navigate(`/study/${deck.id}`) }}
                                                disabled={due === 0}
                                                className="retro-btn bg-accent text-black border-2 border-black shadow-[3px_3px_0_black] hover:shadow-[5px_5px_0_black] text-xs px-4 py-1.5 font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-[3px_3px_0_black]"
                                            >
                                                Study →
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
