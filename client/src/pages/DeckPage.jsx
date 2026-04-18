import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDeckById, getCardsByDeck, getDueCards, deleteDeck, deleteCard } from '../services/api'
import MathText from '../components/MathText'

// ── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
    <div className={`animate-pulse bg-black/10 ${className}`} />
)

// ── Loading layout ────────────────────────────────────────────────────────────
const LoadingState = () => (
    <div className="max-w-3xl mx-auto px-6 py-14 flex flex-col gap-8">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-24 border-2 border-black/10" />)}
        </div>
        <div className="flex gap-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-32" />
        </div>
        <div className="flex flex-col gap-3 mt-4">
            {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-16 border-2 border-black/10" />)}
        </div>
    </div>
)

// ── Main ──────────────────────────────────────────────────────────────────────
const DeckPage = () => {
    const { deckId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [deck, setDeck] = useState(null)
    const [cards, setCards] = useState([])
    const [dueCount, setDueCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [expandedId, setExpandedId] = useState(null)
    const [deletingDeck, setDeletingDeck] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // ── Fetch data ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id || !deckId) return

        const load = async () => {
            try {
                const [deckData, cardsData, dueData] = await Promise.all([
                    getDeckById(deckId),
                    getCardsByDeck(deckId),
                    getDueCards(user.id),
                ])
                setDeck(deckData)
                setCards(cardsData)
                const due = dueData.filter(c => c.deck_id === deckId)
                setDueCount(due.length)
            } catch (err) {
                setError(err.message || 'Failed to load deck.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [deckId, user?.id])

    // ── Derived stats ─────────────────────────────────────────────────────────
    const masteredCount = useMemo(
        () => cards.filter(c => c.interval > 7).length,
        [cards]
    )

    const filteredCards = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return cards
        return cards.filter(
            c =>
                c.front?.toLowerCase().includes(q) ||
                c.back?.toLowerCase().includes(q)
        )
    }, [cards, search])

    // ── Delete deck ───────────────────────────────────────────────────────────
    const handleDeleteDeck = async () => {
        setDeletingDeck(true)
        setShowDeleteModal(false)
        try {
            await deleteDeck(deckId)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
            setDeletingDeck(false)
        }
    }

    // ── Delete card ───────────────────────────────────────────────────────────
    const handleDeleteCard = async (cardId) => {
        try {
            await deleteCard(cardId)
            setCards(prev => prev.filter(c => c.id !== cardId))
            setDueCount(prev => Math.max(0, prev - 1))
        } catch (err) {
            setError(err.message)
        }
    }

    // ── Page shell ────────────────────────────────────────────────────────────
    return (
        <div className="relative min-h-screen bg-white">
            <div className="retro-grid absolute inset-0" />

            {/* Topbar */}
            <nav className="sticky top-0 z-30 border-b-2 border-black bg-white px-8 h-20 flex items-center justify-between">
                <span
                    className="text-2xl font-bold tracking-tight cursor-pointer"
                    style={{ fontFamily: 'Athletics, sans-serif' }}
                    onClick={() => navigate('/dashboard')}
                >
                    MEMORIX<span className="text-[#F5C518]">.</span>
                </span>
            </nav>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-14">

                {loading ? (
                    <LoadingState />
                ) : error ? (
                    <div className="border-2 border-red-500 bg-red-50 px-6 py-5 text-red-600 font-semibold">
                        {error}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="ml-4 underline text-sm"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Back */}
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-black mb-10 transition-colors"
                        >
                            ← Back to Dashboard
                        </Link>

                        {/* Deck header */}
                        <div className="mb-8">
                            <h1
                                className="text-[clamp(28px,4vw,48px)] font-extrabold text-black leading-tight mb-2"
                                style={{ fontFamily: 'Athletics, sans-serif' }}
                            >
                                {deck?.name}
                            </h1>
                            {deck?.description && (
                                <p className="text-base text-black/40">{deck.description}</p>
                            )}
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {[
                                { label: 'Total Cards', value: cards.length },
                                { label: 'Due Today', value: dueCount },
                                { label: 'Mastered', value: masteredCount },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="border-2 border-black shadow-[4px_4px_0_black] bg-white p-5 text-center"
                                >
                                    <div
                                        className="text-3xl font-extrabold text-[#F5C518]"
                                        style={{ fontFamily: 'Athletics, sans-serif' }}
                                    >
                                        {value}
                                    </div>
                                    <div className="text-xs font-semibold text-black/50 mt-1 uppercase tracking-wider">
                                        {label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-4 mb-12">
                            <div className="relative group">
                                <button
                                    onClick={() => navigate(`/study/${deckId}`)}
                                    disabled={dueCount === 0}
                                    className="retro-btn bg-[#F5C518] text-black border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] px-7 py-3 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-[4px_4px_0_black]"
                                >
                                    Start Review →
                                </button>
                                {dueCount === 0 && (
                                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs font-semibold px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        No cards due today
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                disabled={deletingDeck}
                                className="retro-btn bg-white text-red-600 border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] px-7 py-3 text-base font-bold disabled:opacity-50"
                            >
                                {deletingDeck ? 'Deleting…' : 'Delete Deck'}
                            </button>
                        </div>

                        {/* Cards section */}
                        <div>
                            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                                <h2
                                    className="text-[20px] font-extrabold text-black"
                                    style={{ fontFamily: 'Athletics, sans-serif' }}
                                >
                                    All Cards ({cards.length})
                                </h2>

                                {/* Search */}
                                {cards.length > 0 && (
                                    <div className="relative flex-1 min-w-50 max-w-xs cursor-pointer">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 text-base select-none">
                                            🔍
                                        </span>
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            placeholder="Search cards…"
                                            style={{ boxShadow: '3px 3px 0px black' }}
                                            className="w-full border-2 border-black pl-9 pr-4 py-2.5 text-[14px] rounded-none outline-none focus:border-[#F5C518] placeholder:text-black/30 transition-colors"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Empty state */}
                            {cards.length === 0 ? (
                                <div className="border-2 border-black shadow-[4px_4px_0_black] bg-white py-16 flex flex-col items-center gap-4">
                                    <span className="text-6xl">📭</span>
                                    <p className="text-xl font-bold text-black">No cards yet</p>
                                    <p className="text-sm text-black/50">Upload a PDF to generate cards</p>
                                    <Link
                                        to="/new-deck"
                                        className="retro-btn mt-2 bg-[#F5C518] text-black border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] px-6 py-2.5 text-sm font-bold"
                                    >
                                        + New Deck
                                    </Link>
                                </div>
                            ) : filteredCards.length === 0 ? (
                                <div className="border-2 border-black py-10 flex flex-col items-center gap-2">
                                    <span className="text-3xl">🔍</span>
                                    <p className="text-base font-semibold text-black/50">No cards match "{search}"</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {filteredCards.map(card => (
                                        <CardRow
                                            key={card.id}
                                            card={card}
                                            expanded={expandedId === card.id}
                                            onToggle={() => setExpandedId(expandedId === card.id ? null : card.id)}
                                            onDelete={handleDeleteCard}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ── Delete confirmation modal ── */}
            {showDeleteModal && (
                <div
                    onClick={() => setShowDeleteModal(false)}
                    className="fixed inset-0 z-100 bg-black/45 flex items-center justify-center p-4"
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="bg-white border-2 border-black shadow-[6px_6px_0_black] p-8 max-w-105 w-full"
                    >
                        <p className="text-[22px] font-extrabold text-black mb-2" style={{ fontFamily: 'Athletics, sans-serif' }}>
                            Delete “{deck?.name}”?
                        </p>
                        <p className="text-sm text-black/50 mb-7">
                            This will permanently delete the deck and all its cards. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 text-[15px] font-bold bg-white border-2 border-black shadow-[3px_3px_0_black] hover:shadow-[5px_5px_0_black] cursor-pointer transition-shadow"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteDeck}
                                className="flex-1 py-3 text-[15px] font-bold bg-red-600 text-white border-2 border-black shadow-[3px_3px_0_black] hover:shadow-[5px_5px_0_black] cursor-pointer transition-shadow"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DeckPage

// ── CardRow ───────────────────────────────────────────────────────────────────
const CardRow = ({ card, expanded, onToggle, onDelete }) => {
    const [deleting, setDeleting] = useState(false)
    const [hintOpen, setHintOpen] = useState(false)

    const handleToggle = () => {
        if (expanded) setHintOpen(false)
        onToggle()
    }

    const handleDelete = async (e) => {
        e.stopPropagation()
        setDeleting(true)
        await onDelete(card.id)
        setDeleting(false)
    }

    return (
        <div className="border-2 border-black shadow-[3px_3px_0px_black] mb-3 bg-white overflow-hidden">

            {/* ── Header row (clickable) ── */}
            <div
                onClick={handleToggle}
                className={`group flex items-center justify-between gap-3 px-5 py-4 cursor-pointer transition-colors duration-150 ${expanded ? 'bg-[#F5C518]' : 'bg-white hover:bg-yellow-50'
                    }`}
            >
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-black">
                        <MathText text={card.front} />
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[13px] text-black/40 font-bold inline-block leading-none transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'
                        }`}>▼</span>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        aria-label="Delete card"
                        className={`border-2 border-black shadow-[2px_2px_0_black] w-9 h-9 flex items-center justify-center text-[15px] bg-white hover:bg-red-100 shrink-0 transition-opacity duration-150 ${deleting ? 'cursor-not-allowed' : 'cursor-pointer'
                            } ${expanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                    >
                        {deleting ? '…' : '🗑'}
                    </button>
                </div>
            </div>

            {/* ── Expandable answer panel ── */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-96' : 'max-h-0'
                }`}>
                <div className="border-t-2 border-black bg-[#fffdf0] px-5 pt-3.5 pb-4">
                    <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest block mb-2">
                        Answer
                    </span>
                    <div className="text-[15px] font-semibold text-[#111] leading-relaxed">
                        <MathText text={card.back} />
                    </div>
                    {card.hint && (
                        <div className="mt-3">
                            {hintOpen ? (
                                <div className="bg-[#F5C518] border-2 border-black px-3.5 py-2 text-[13px] font-semibold inline-block">
                                    💡 <MathText text={card.hint} />
                                </div>
                            ) : (
                                <button
                                    onClick={e => { e.stopPropagation(); setHintOpen(true) }}
                                    className="border-2 border-black/25 hover:border-black px-3.5 py-1.5 text-[13px] font-semibold text-black/50 hover:text-black bg-transparent cursor-pointer transition-colors"
                                >
                                    💡 Show Hint
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


