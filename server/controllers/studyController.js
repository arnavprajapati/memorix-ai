const { createClient } = require('@supabase/supabase-js')
const { calculateNextReview } = require('../services/sm2Service')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// GET /api/study/:userId/due
async function getDueCards(req, res) {
    try {
        const { userId } = req.params
        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', userId)
            .lte('due_date', today)
            .order('due_date', { ascending: true })

        if (error) throw error
        res.json(data)
    } catch (err) {
        console.error('[studyController] getDueCards:', err.message)
        res.status(500).json({ error: err.message })
    }
}

// POST /api/study/rating
async function submitRating(req, res) {
    try {
        const { cardId, rating, userId } = req.body

        if (cardId === undefined || rating === undefined || !userId) {
            return res.status(400).json({ error: 'cardId, rating, and userId are required' })
        }
        if (!Number.isInteger(rating) || rating < 0 || rating > 3) {
            return res.status(400).json({ error: 'rating must be an integer 0–3' })
        }

        // Fetch current card
        const { data: card, error: fetchError } = await supabase
            .from('cards')
            .select('*')
            .eq('id', cardId)
            .single()

        if (fetchError) throw fetchError
        if (!card) return res.status(404).json({ error: 'Card not found' })

        // Calculate new SM-2 values
        const { interval, ease_factor, repetitions, due_date } = calculateNextReview(card, rating)

        // Update card
        const { data: updatedCard, error: updateError } = await supabase
            .from('cards')
            .update({ interval, ease_factor, repetitions, due_date })
            .eq('id', cardId)
            .select()
            .single()

        if (updateError) throw updateError

        // Log the review
        const { error: logError } = await supabase
            .from('study_logs')
            .insert({ card_id: cardId, user_id: userId, rating })

        if (logError) console.error('[studyController] study_log insert failed:', logError.message)

        res.json(updatedCard)
    } catch (err) {
        console.error('[studyController] submitRating:', err.message)
        res.status(500).json({ error: err.message })
    }
}

// GET /api/study/:userId/streak
async function getStreak(req, res) {
    try {
        const { userId } = req.params

        const { data, error } = await supabase
            .from('study_logs')
            .select('reviewed_at')
            .eq('user_id', userId)
            .order('reviewed_at', { ascending: false })

        if (error) throw error

        if (!data || data.length === 0) return res.json({ streak: 0 })

        // Get unique YYYY-MM-DD dates, most recent first
        const dates = [...new Set(data.map(l => l.reviewed_at.slice(0, 10)))]
        dates.sort((a, b) => b.localeCompare(a))

        const today = new Date().toISOString().slice(0, 10)
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

        // Streak must start from today or yesterday (not broken yet)
        if (dates[0] !== today && dates[0] !== yesterday) {
            return res.json({ streak: 0 })
        }

        let streak = 1
        for (let i = 1; i < dates.length; i++) {
            const prev = new Date(dates[i - 1] + 'T00:00:00Z')
            const curr = new Date(dates[i] + 'T00:00:00Z')
            const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24))
            if (diffDays === 1) {
                streak++
            } else {
                break
            }
        }

        res.json({ streak })
    } catch (err) {
        console.error('[studyController] getStreak:', err.message)
        res.status(500).json({ error: err.message })
    }
}

module.exports = { getDueCards, submitRating, getStreak }
