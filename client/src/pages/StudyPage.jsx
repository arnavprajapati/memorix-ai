import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDueCards, getCardsByDeck, submitRating } from '../services/api'
import MathText from '../components/MathText'

// ── Rating config ─────────────────────────────────────────────────────────────
const RATINGS = [
    { label: 'Again', emoji: '😵', value: 0, bg: 'bg-white', key: '1' },
    { label: 'Hard', emoji: '😐', value: 1, bg: 'bg-white', key: '2' },
    { label: 'Good', emoji: '🙂', value: 2, bg: 'bg-[#F5C518]', key: '3' },
    { label: 'Easy', emoji: '😎', value: 3, bg: 'bg-[#F5C518]', key: '4' },
]

const STAT_COLORS = {
    again: 'text-red-600',
    hard: 'text-orange-500',
    good: 'text-blue-600',
    easy: 'text-green-600',
}

// ── All-done screen ───────────────────────────────────────────────────────────
const AllDoneScreen = ({ deckId, nextDue }) => (
    <CenteredCard>
        <span className="text-6xl mt-3.5">✅</span>
        <h2 className="text-3xl font-extrabold text-black mt-4" style={{ fontFamily: 'Athletics, sans-serif' }}>
            You're all caught up!
        </h2>
        <p className="text-base text-black/50 mt-2">No cards due for review right now</p>
        {nextDue && (
            <p className="mt-3 text-sm font-semibold text-black/40">
                Next review: <span className="text-black">{nextDue}</span>
            </p>
        )}
        <Link
            to={`/deck/${deckId}`}
            className="mt-8 retro-btn bg-[#F5C518] text-black border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] px-8 py-3 font-bold"
        >
            Back to Deck
        </Link>
    </CenteredCard>
)

// ── Session complete screen ───────────────────────────────────────────────────
const SessionComplete = ({ deckId, stats, total }) => (
    <CenteredCard>
        <span className="text-6xl">🎉</span>
        <h2 className="text-3xl font-extrabold text-black mt-4" style={{ fontFamily: 'Athletics, sans-serif' }}>
            Session Complete!
        </h2>
        <p className="text-base text-black/50 mt-2">You reviewed {total} card{total !== 1 ? 's' : ''} today</p>

        <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm">
            {[
                { label: 'Again', key: 'again', color: 'text-red-600', border: 'border-red-300' },
                { label: 'Hard', key: 'hard', color: 'text-orange-500', border: 'border-orange-300' },
                { label: 'Good', key: 'good', color: 'text-blue-600', border: 'border-blue-300' },
                { label: 'Easy', key: 'easy', color: 'text-green-600', border: 'border-green-300' },
            ].map(({ label, key, color, border }) => (
                <div key={key} className={`border-2 ${border} shadow-[3px_3px_0_black] p-4 text-center bg-white`}>
                    <div className={`text-2xl font-extrabold ${color}`} style={{ fontFamily: 'Athletics, sans-serif' }}>
                        {stats[key]}
                    </div>
                    <div className="text-xs font-semibold text-black/50 mt-1 uppercase tracking-wider">{label}</div>
                </div>
            ))}
        </div>

        <p className="mt-6 text-base font-semibold text-black/60">🔥 Keep your streak going!</p>

        <div className="flex gap-4 mt-6 flex-wrap justify-center">
            <Link
                to={`/deck/${deckId}`}
                className="retro-btn bg-white text-black border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] px-6 py-3 font-bold"
            >
                Back to Deck
            </Link>
            <button
                onClick={() => window.location.reload()}
                className="retro-btn bg-[#F5C518] text-black border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] px-6 py-3 font-bold"
            >
                Review Again
            </button>
        </div>
    </CenteredCard>
)

// ── Centred card shell ────────────────────────────────────────────────────────
const CenteredCard = ({ children }) => (
    <div className="relative min-h-screen bg-white">
        <div className="retro-grid absolute inset-0" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-md border-2 border-black bg-white shadow-[6px_6px_0_black] p-10 flex flex-col items-center text-center">
                {children}
            </div>
        </div>
    </div>
)

// ── Main StudyPage ────────────────────────────────────────────────────────────
const StudyPage = () => {
    const { deckId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [cards, setCards] = useState([])
    const [allDeckCards, setAllDeckCards] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [hintOpen, setHintOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 })
    const [sessionDone, setSessionDone] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id || !deckId) return
        const load = async () => {
            try {
                const [due, all] = await Promise.all([
                    getDueCards(user.id),
                    getCardsByDeck(deckId),
                ])
                setCards(due.filter(c => c.deck_id === deckId))
                setAllDeckCards(all)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [deckId, user?.id])

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    const handleRate = useCallback(async (ratingValue) => {
        if (isSubmitting || !isFlipped) return
        const ratingKeys = ['again', 'hard', 'good', 'easy']
        const card = cards[currentIndex]

        setIsSubmitting(true)
        try {
            await submitRating(card.id, ratingValue, user.id)
        } catch (e) {
            console.error('[StudyPage] submitRating failed:', e.message)
        }

        setSessionStats(prev => ({
            ...prev,
            [ratingKeys[ratingValue]]: prev[ratingKeys[ratingValue]] + 1,
        }))
        setIsFlipped(false)
        setHintOpen(false)
        setIsSubmitting(false)

        if (currentIndex + 1 >= cards.length) {
            setSessionDone(true)
        } else {
            setCurrentIndex(i => i + 1)
        }
    }, [isSubmitting, isFlipped, cards, currentIndex, user?.id])

    useEffect(() => {
        const onKey = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
            if (e.key === ' ' && !isFlipped) {
                e.preventDefault()
                setIsFlipped(true)
            }
            if (isFlipped) {
                if (e.key === '1') handleRate(0)
                if (e.key === '2') handleRate(1)
                if (e.key === '3') handleRate(2)
                if (e.key === '4') handleRate(3)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [isFlipped, handleRate])

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <CenteredCard>
                <div className="w-12 h-12 rounded-full border-4 border-black border-t-[#F5C518] animate-spin" />
                <p className="mt-6 font-semibold text-black/50">Loading cards…</p>
            </CenteredCard>
        )
    }

    if (error) {
        return (
            <CenteredCard>
                <p className="text-red-600 font-semibold">{error}</p>
                <button onClick={() => navigate(`/deck/${deckId}`)} className="mt-4 underline text-sm">
                    ← Back to Deck
                </button>
            </CenteredCard>
        )
    }

    // ── All-done (no due cards) ───────────────────────────────────────────────
    if (cards.length === 0) {
        const futureDates = allDeckCards
            .map(c => c.due_date)
            .filter(Boolean)
            .sort()
        const nextDue = futureDates[0] || null
        return <AllDoneScreen deckId={deckId} nextDue={nextDue} />
    }

    // ── Session complete ──────────────────────────────────────────────────────
    if (sessionDone) {
        return <SessionComplete deckId={deckId} stats={sessionStats} total={cards.length} />
    }

    const card = cards[currentIndex]
    const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'white', position: 'relative' }}>
            <div className="retro-grid absolute inset-0" />

            {/* ── Fixed top bar ── */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'white' }}>
                {/* Nav row */}
                <div style={{
                    height: '64px',
                    borderBottom: '2px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                }}>
                    <Link
                        to={`/deck/${deckId}`}
                        style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(0,0,0,0.45)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#000'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.45)'}
                    >
                        ← Back
                    </Link>

                    <span
                        style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', fontFamily: 'Athletics, sans-serif', cursor: 'pointer' }}
                        onClick={() => navigate('/dashboard')}
                    >
                        MEMORIX<span style={{ color: '#F5C518' }}>.</span>
                    </span>

                    <span style={{
                        fontSize: '12px', fontWeight: 700,
                        color: 'rgba(0,0,0,0.45)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                    }}>
                        Card {currentIndex + 1} of {cards.length}
                    </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '6px', backgroundColor: '#e5e5e5', borderBottom: '1px solid black' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        backgroundColor: '#F5C518',
                        transition: 'width 0.35s ease',
                    }} />
                </div>
            </div>

            {/* ── Main content (centered below topbar) ── */}
            <div style={{
                paddingTop: '71px', /* 64px nav + 6px bar + 1px border */
                minHeight: 'calc(100vh - 71px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '71px 16px 48px',
                position: 'relative',
                zIndex: 10,
            }}>

                {/* Card — no absolute positioning so height grows with content */}
                <div style={{ width: '100%', maxWidth: '620px' }}>

                    {/* ── Front face ── */}
                    <div style={{
                        display: isFlipped ? 'none' : 'flex',
                        flexDirection: 'column',
                        border: '2px solid black',
                        backgroundColor: 'white',
                        boxShadow: '6px 6px 0 black',
                        padding: '40px',
                        minHeight: '300px',
                    }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
                            Question
                        </span>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ fontSize: '20px', fontWeight: 700, color: '#000', textAlign: 'center', lineHeight: 1.5 }}>
                                <MathText text={card.front} />
                            </p>
                        </div>

                        {/* Hint */}
                        {card.hint && (
                            <div style={{ marginTop: '24px' }}>
                                {hintOpen ? (
                                    <span style={{ display: 'inline-block', backgroundColor: '#F5C518', border: '1px solid black', fontSize: '13px', fontWeight: 600, padding: '4px 14px' }}>
                                        💡 <MathText text={card.hint} />
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => setHintOpen(true)}
                                        style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(0,0,0,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        💡 Show Hint
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Back face ── */}
                    <div style={{
                        display: isFlipped ? 'flex' : 'none',
                        flexDirection: 'column',
                        border: '2px solid black',
                        backgroundColor: 'white',
                        boxShadow: '6px 6px 0 black',
                        padding: '40px',
                        minHeight: '300px',
                    }}>
                        {/* Header row: ANSWER label + flip-back button */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Answer
                            </span>
                            <button
                                onClick={() => setIsFlipped(false)}
                                style={{
                                    fontSize: '13px', fontWeight: 700,
                                    color: '#000',
                                    background: 'white',
                                    border: '2px solid black',
                                    boxShadow: '2px 2px 0 black',
                                    cursor: 'pointer',
                                    padding: '4px 12px',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '4px 4px 0 black'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '2px 2px 0 black'}
                            >
                                ← See Question
                            </button>
                        </div>

                        <div style={{ borderTop: '2px solid rgba(0,0,0,0.1)', marginBottom: '20px' }} />

                        {/* Answer text — dark, large, readable */}
                        <p style={{ fontSize: '18px', fontWeight: 700, color: '#111', lineHeight: 1.75 }}>
                            <MathText text={card.back} />
                        </p>
                    </div>
                </div>

                {/* ── Show Answer / Rating buttons (outside card) ── */}
                <div style={{ width: '100%', maxWidth: '620px', marginTop: '20px' }}>
                    {!isFlipped ? (
                        <>
                            <button
                                onClick={() => setIsFlipped(true)}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#F5C518',
                                    color: '#000',
                                    border: '2px solid black',
                                    boxShadow: '4px 4px 0 black',
                                    padding: '14px',
                                    fontSize: '15px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.15s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '6px 6px 0 black'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '4px 4px 0 black'}
                            >
                                Show Answer →
                            </button>
                            <p style={{ marginTop: '10px', fontSize: '18px', color: 'rgba(0,0,0,0.25)', textAlign: 'center', userSelect: 'none' }}>
                                Space to reveal answer
                            </p>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {RATINGS.map(({ label, emoji, value, key }) => {
                                    const isYellow = value === 2 || value === 3
                                    return (
                                        <button
                                            key={value}
                                            onClick={() => handleRate(value)}
                                            disabled={isSubmitting}
                                            style={{
                                                backgroundColor: isYellow ? '#F5C518' : 'white',
                                                border: '2px solid black',
                                                boxShadow: '4px 4px 0 black',
                                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                opacity: isSubmitting ? 0.5 : 1,
                                                padding: '16px 8px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'box-shadow 0.15s ease',
                                            }}
                                            onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.boxShadow = '6px 6px 0 black' }}
                                            onMouseLeave={e => e.currentTarget.style.boxShadow = '4px 4px 0 black'}
                                        >
                                            <span style={{ fontSize: '26px', lineHeight: 1 }}>{emoji}</span>
                                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#000' }}>{label}</span>
                                            <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(0,0,0,0.4)' }}>[{key}]</span>
                                        </button>
                                    )
                                })}
                            </div>
                            <p style={{ marginTop: '12px', fontSize: '14px', color: 'rgba(0,0,0,0.3)', textAlign: 'center', userSelect: 'none' }}>
                                1 = Again &bull; 2 = Hard &bull; 3 = Good &bull; 4 = Easy
                            </p>
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}

export default StudyPage
