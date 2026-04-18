const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// POST /api/decks
async function createDeck(req, res) {
    try {
        const { name, description, userId } = req.body

        if (!name?.trim()) return res.status(400).json({ error: 'name is required' })
        if (!userId) return res.status(400).json({ error: 'userId is required' })

        const { data, error } = await supabase
            .from('decks')
            .insert({ name: name.trim(), description: description?.trim() || null, user_id: userId })
            .select()
            .single()

        if (error) throw error
        res.status(201).json(data)
    } catch (err) {
        console.error('[deckController] createDeck:', err.message)
        res.status(500).json({ error: err.message })
    }
}

// GET /api/decks/:userId
async function getUserDecks(req, res) {
    try {
        const { userId } = req.params

        const { data, error } = await supabase
            .from('decks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (err) {
        console.error('[deckController] getUserDecks:', err.message)
        res.status(500).json({ error: err.message })
    }
}

// GET /api/decks/deck/:deckId
async function getDeckById(req, res) {
    try {
        const { deckId } = req.params

        const { data, error } = await supabase
            .from('decks')
            .select('*, cards(count)')
            .eq('id', deckId)
            .single()

        if (error) throw error
        if (!data) return res.status(404).json({ error: 'Deck not found' })
        res.json(data)
    } catch (err) {
        console.error('[deckController] getDeckById:', err.message)
        res.status(500).json({ error: err.message })
    }
}

// DELETE /api/decks/:deckId
async function deleteDeck(req, res) {
    try {
        const { deckId } = req.params

        const { error } = await supabase.from('decks').delete().eq('id', deckId)
        if (error) throw error

        res.json({ message: 'Deck deleted' })
    } catch (err) {
        console.error('[deckController] deleteDeck:', err.message)
        res.status(500).json({ error: err.message })
    }
}

module.exports = { createDeck, getUserDecks, getDeckById, deleteDeck }
