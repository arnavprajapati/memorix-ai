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

const RATING_META = [
    { label: 'Again', emoji: '😵', color: '#dc2626', desc: 'Completely forgot', value: 0 },
    { label: 'Hard', emoji: '😐', color: '#ea580c', desc: 'Recalled with effort', value: 1 },
    { label: 'Good', emoji: '🙂', color: '#2563eb', desc: 'Recalled correctly', value: 2 },
    { label: 'Easy', emoji: '😎', color: '#16a34a', desc: 'Effortless recall', value: 3 },
]

// Mirror of server sm2Service — calculates next interval client-side for preview
function previewInterval(card, rating) {
    let { interval = 1, ease_factor = 2.5, repetitions = 0 } = card
    switch (rating) {
        case 0: interval = 1; break
        case 1: interval = Math.max(1, Math.round(interval * 1.2)); break
        case 2:
            repetitions = repetitions + 1
            if (repetitions === 1) interval = 1
            else if (repetitions === 2) interval = 4
            else interval = Math.round(interval * ease_factor)
            break
        case 3:
            repetitions = repetitions + 1
            if (repetitions === 1) interval = 4
            else if (repetitions === 2) interval = 4
            else interval = Math.round(interval * ease_factor * 1.3)
            break
        default: break
    }
    return interval
}

function formatNextDate(days) {
    if (days === 1) return 'Tomorrow'
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ── Rating Guide Panel ────────────────────────────────────────────────────────
const RatingGuide = ({ onClose, card }) => (
    <div style={{
        position: 'fixed',
        right: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        width: '240px',
        border: '2px solid black',
        backgroundColor: 'white',
        boxShadow: '5px 5px 0 black',
    }}>
        <div style={{
            borderBottom: '2px solid black',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F5C518',
        }}>
            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>If you click…</span>
            <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}
            >✕</button>
        </div>
        {RATING_META.map(({ label, emoji, color, desc, value }) => {
            const days = card ? previewInterval(card, value) : null
            const nextLabel = days !== null ? formatNextDate(days) : '—'
            return (
                <div key={label} style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>{emoji}</span>
                            <span style={{ fontSize: '16px', fontWeight: 800, color }}>{label}</span>
                        </div>
                        <span style={{
                            fontSize: '12px', fontWeight: 800,
                            color: 'white',
                            backgroundColor: color,
                            padding: '2px 8px',
                            borderRadius: '2px',
                        }}>{nextLabel}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)', margin: 0 }}>{desc}</p>
                </div>
            )
        })}
    </div>
)

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
const STAT_ITEMS = [
    { label: 'Again', key: 'again', color: '#dc2626', border: '#fca5a5', emoji: '😵' },
    { label: 'Hard', key: 'hard', color: '#ea580c', border: '#fdba74', emoji: '😐' },
    { label: 'Good', key: 'good', color: '#2563eb', border: '#93c5fd', emoji: '🙂' },
    { label: 'Easy', key: 'easy', color: '#16a34a', border: '#86efac', emoji: '😎' },
]

const SessionComplete = ({ deckId, stats, total }) => {
    const accuracy = total > 0 ? Math.round(((stats.good + stats.easy) / total) * 100) : 0
    const needsWork = stats.again + stats.hard
    const mastered = stats.good + stats.easy
    return (
        <div className="relative min-h-screen bg-white">
            <div className="retro-grid absolute inset-0" />
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>

                    {/* ── Main card ── */}
                    <div className="w-full border-2 border-black bg-white shadow-[6px_6px_0_black] p-10 flex flex-col items-center text-center"
                        style={{ maxWidth: '420px' }}>
                        <span style={{ fontSize: '56px' }}>🎉</span>
                        <h2 className="text-3xl font-extrabold text-black mt-4" style={{ fontFamily: 'Athletics, sans-serif' }}>
                            Session Complete!
                        </h2>
                        <p className="text-base mt-2" style={{ color: 'rgba(0,0,0,0.45)' }}>
                            You reviewed <strong>{total}</strong> card{total !== 1 ? 's' : ''} today
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '28px', width: '100%' }}>
                            {STAT_ITEMS.map(({ label, key, color, border, emoji }) => (
                                <div key={key} style={{
                                    border: `2px solid ${border}`,
                                    boxShadow: '3px 3px 0 black',
                                    padding: '16px 8px',
                                    textAlign: 'center',
                                    backgroundColor: 'white',
                                }}>
                                    <div style={{ fontSize: '28px', fontWeight: 900, color, fontFamily: 'Athletics, sans-serif' }}>
                                        {stats[key]}
                                    </div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.45)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="mt-6 text-base font-semibold" style={{ color: 'rgba(0,0,0,0.55)' }}>🔥 Keep your streak going!</p>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                    </div>

                    {/* ── Side summary panel ── */}
                    <div style={{
                        width: '220px',
                        border: '2px solid black',
                        backgroundColor: 'white',
                        boxShadow: '5px 5px 0 black',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            borderBottom: '2px solid black',
                            padding: '10px 16px',
                            backgroundColor: '#F5C518',
                        }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Session Summary</span>
                        </div>

                        {/* Accuracy */}
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Accuracy</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '36px', fontWeight: 900, color: accuracy >= 70 ? '#16a34a' : accuracy >= 40 ? '#ea580c' : '#dc2626', fontFamily: 'Athletics, sans-serif' }}>{accuracy}%</span>
                            </div>
                            <div style={{ marginTop: '8px', height: '8px', backgroundColor: '#e5e5e5', border: '1px solid black' }}>
                                <div style={{ height: '100%', width: `${accuracy}%`, backgroundColor: accuracy >= 70 ? '#16a34a' : accuracy >= 40 ? '#F5C518' : '#dc2626', transition: 'width 0.6s ease' }} />
                            </div>
                        </div>

                        {/* Mastered vs Needs Work */}
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#16a34a', fontFamily: 'Athletics, sans-serif' }}>{mastered}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Mastered</div>
                                </div>
                                <div style={{ width: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '28px', fontWeight: 900, color: '#dc2626', fontFamily: 'Athletics, sans-serif' }}>{needsWork}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Needs Work</div>
                                </div>
                            </div>
                        </div>

                        {/* Per-rating breakdown */}
                        <div style={{ padding: '16px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Breakdown</p>
                            {STAT_ITEMS.map(({ label, key, color, emoji }) => {
                                const pct = total > 0 ? Math.round((stats[key] / total) * 100) : 0
                                return (
                                    <div key={key} style={{ marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color }}>{emoji} {label}</span>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(0,0,0,0.5)' }}>{stats[key]} ({pct}%)</span>
                                        </div>
                                        <div style={{ height: '6px', backgroundColor: '#e5e5e5', border: '1px solid rgba(0,0,0,0.1)' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, transition: 'width 0.5s ease' }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

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
    const [showGuide, setShowGuide] = useState(true)

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

                {/* ── Rating Guide (right side, visible when flipped) ── */}
                {isFlipped && showGuide && <RatingGuide onClose={() => setShowGuide(false)} card={card} />}
                {isFlipped && !showGuide && (
                    <button
                        onClick={() => setShowGuide(true)}
                        title="How ratings work"
                        className="fixed right-5 top-1/2 -translate-y-1/2 z-40 w-9 h-9 border-2 border-black bg-[#F5C518] shadow-[3px_3px_0_black] cursor-pointer font-extrabold text-base"
                    >?</button>
                )}

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
