import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createDeck, uploadPDF } from '../services/api'

const LOADING_MESSAGES = [
    'Reading your PDF... 📖',
    'Finding key concepts... 🧠',
    'Building your deck... ⚡',
    'Almost ready... 🎉',
    'Gemini is busy, retrying... ⏳',
]

// Defined outside so it never re-mounts on state changes
const Card = ({ children }) => (
    <div className="relative min-h-screen bg-white">
        <div className="retro-grid absolute inset-0" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg border-2 border-black bg-white shadow-[6px_6px_0_black] p-10">
                {children}
            </div>
        </div>
    </div>
)

const NewDeckPage = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)

    // Rotate loading messages
    useEffect(() => {
        if (!loading) return
        let i = 0
        const id = setInterval(() => {
            i = (i + 1) % LOADING_MESSAGES.length
            setLoadingMsg(LOADING_MESSAGES[i])
        }, 3000)
        return () => clearInterval(id)
    }, [loading])

    // ── Step 1 submit ───────────────────────────────────────────────────────
    const handleContinue = () => {
        if (!name.trim()) return
        setError('')
        setStep(2)
    }

    // ── File selection ──────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const selected = e.target.files?.[0]
        validateAndSet(selected)
    }

    const validateAndSet = (selected) => {
        if (!selected) return
        if (selected.type !== 'application/pdf') {
            setError('Only PDF files are accepted.')
            return
        }
        if (selected.size > 10 * 1024 * 1024) {
            setError('File must be under 10 MB.')
            return
        }
        setError('')
        setFile(selected)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        validateAndSet(e.dataTransfer.files?.[0])
    }

    // ── Step 2 submit ───────────────────────────────────────────────────────
    const handleGenerate = async () => {
        if (!file) return
        setError('')
        setLoading(true)
        setLoadingMsg(LOADING_MESSAGES[0])

        try {
            const userId = user.id
            const deck = await createDeck(name.trim(), description.trim(), userId)
            await uploadPDF(deck.id, userId, name.trim(), file)
            navigate(`/deck/${deck.id}`)
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    // ── Loading screen ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <Card>
                <div className="flex flex-col items-center text-center py-8 gap-6">
                    {/* Spinner */}
                    <div className="w-16 h-16 rounded-full border-4 border-black border-t-[#F5C518] animate-spin" />
                    <p className="text-2xl font-bold text-black" style={{ fontFamily: 'Athletics, sans-serif' }}>
                        Generating your flashcards...
                    </p>
                    <p className="text-base text-black/40">This takes about 10–15 seconds</p>
                    <p className="text-base font-semibold text-black/70 min-h-[24px] transition-all">
                        {loadingMsg}
                    </p>
                </div>
            </Card>
        )
    }

    // ── Step 1 — Deck details ───────────────────────────────────────────────
    if (step === 1) {
        return (
            <Card>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-black mb-8 transition-colors"
                >
                    ← Back to Dashboard
                </Link>

                <h1 className="text-3xl font-extrabold text-black mb-2" style={{ fontFamily: 'Athletics, sans-serif' }}>
                    Create New Deck
                </h1>
                <p className="text-base text-black/50 mb-8">Give your deck a name before uploading</p>

                {error && (
                    <div className="mb-6 border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                            Deck Name <span className="text-[#F5C518]">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                            placeholder="e.g. Quadratic Equations"
                            className="w-full border-2 border-black px-4 py-3 text-base outline-none focus:shadow-[3px_3px_0_black] transition-shadow placeholder:text-black/30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                            Description <span className="text-black/30 font-normal normal-case">(optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this deck about?"
                            rows={3}
                            className="w-full border-2 border-black px-4 py-3 text-base outline-none focus:shadow-[3px_3px_0_black] transition-shadow resize-none placeholder:text-black/30"
                        />
                    </div>

                    <button
                        onClick={handleContinue}
                        disabled={!name.trim()}
                        className="retro-btn w-full bg-[#F5C518] text-black border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] py-3.5 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-[4px_4px_0_black] disabled:hover:shadow-[4px_4px_0_black]"
                    >
                        Continue →
                    </button>
                </div>
            </Card>
        )
    }

    // ── Step 2 — Upload PDF ─────────────────────────────────────────────────
    return (
        <Card>
            <button
                onClick={() => { setStep(1); setFile(null); setError('') }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-black mb-8 transition-colors"
            >
                ← Back
            </button>

            <h1 className="text-3xl font-extrabold text-black mb-2" style={{ fontFamily: 'Athletics, sans-serif' }}>
                Upload Your PDF
            </h1>
            <p className="text-base text-black/50 mb-8">We'll generate smart flashcards automatically</p>

            {error && (
                <div className="mb-6 border-2 border-red-500 bg-red-50 px-4 py-3 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-red-600">{error}</span>
                    <button
                        onClick={() => { setError(''); setFile(null) }}
                        className="text-sm font-bold text-red-600 underline shrink-0"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Drop zone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`
                    mb-6 flex flex-col items-center justify-center gap-3 cursor-pointer
                    border-2 border-dashed border-black px-8 py-12 transition-all
                    ${dragOver ? 'bg-[#fef9c3]' : file ? 'bg-[#f0fdf4]' : 'bg-[#fefce8] hover:bg-[#fef9c3]'}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {file ? (
                    <>
                        <span className="text-4xl">✅</span>
                        <p className="text-base font-bold text-black text-center break-all">{file.name}</p>
                        <p className="text-sm text-black/40">Click to change file</p>
                    </>
                ) : (
                    <>
                        <span className="text-4xl">📄</span>
                        <p className="text-base font-bold text-black">Drag & drop your PDF here</p>
                        <p className="text-sm text-black/40">or click to browse</p>
                        <p className="text-xs text-black/30 mt-1">PDF only · max 10 MB</p>
                    </>
                )}
            </div>

            <button
                onClick={handleGenerate}
                disabled={!file}
                className="retro-btn w-full bg-[#F5C518] text-black border-2 border-black shadow-[4px_4px_0_black] hover:shadow-[6px_6px_0_black] py-3.5 text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-[4px_4px_0_black] disabled:hover:shadow-[4px_4px_0_black]"
            >
                Generate Flashcards →
            </button>
        </Card>
    )
}

export default NewDeckPage
