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

module.exports = { getDueCards, submitRating }
