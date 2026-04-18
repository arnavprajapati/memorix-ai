const { createClient } = require('@supabase/supabase-js')
const pdfParse = require('pdf-parse')
const { generateFlashcards, generateEmbedding } = require('../services/geminiService')
const { upsertCard, searchSimilar, deleteCard: deletePineconeCard } = require('../services/pineconeService')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const DUPLICATE_THRESHOLD = 0.92

// POST /api/decks/:deckId/upload
async function uploadAndGenerateCards(req, res) {
    try {
        if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' })

        const { deckId, userId, deckName } = req.body
        if (!deckId || !userId) {
            return res.status(400).json({ error: 'deckId and userId are required' })
        }

        // Step 1: Parse PDF
        let pdfText
        try {
            const parsed = await pdfParse(req.file.buffer)
            pdfText = parsed.text?.trim()
        } catch (e) {
            return res.status(422).json({ error: 'Failed to parse PDF: ' + e.message })
        }
        if (!pdfText) return res.status(422).json({ error: 'No text found in PDF' })

        // Step 2: Generate flashcards via Gemini
        const generated = await generateFlashcards(pdfText, deckName || 'Untitled Deck')
        if (!generated.length) {
            return res.status(422).json({ error: 'Gemini could not generate flashcards from this content' })
        }

        const createdCards = []

        for (const card of generated) {
            // Normalize field names — Gemini sometimes returns question/answer or Q/A
            const front = (card.front || card.question || card.Q || card.term || '').trim()
            const back = (card.back || card.answer || card.A || card.definition || '').trim()
            const hint = card.hint || card.tip || null

            if (!front || !back) {
                console.warn('[cardController] skipping card with missing front/back:', JSON.stringify(card).slice(0, 100))
                continue
            }

            // Step 3a: Generate embedding
            let embedding
            try {
                embedding = await generateEmbedding(`${front} ${back}`)
            } catch (e) {
                console.error('[cardController] embedding failed for card, skipping:', e.message)
                continue
            }

            // Step 3b: Duplicate check (disabled — all cards saved)
            // try {
            //     const similar = await searchSimilar(embedding, userId, 3)
            //     if (similar.some(m => m.score > DUPLICATE_THRESHOLD)) {
            //         console.log('[cardController] duplicate detected, skipping card:', front.slice(0, 40))
            //         continue
            //     }
            // } catch (e) {
            //     console.error('[cardController] similarity search failed, proceeding without check:', e.message)
            // }

            // Step 3c: Insert card into Supabase
            const { data: newCard, error: insertError } = await supabase
                .from('cards')
                .insert({
                    deck_id: deckId,
                    user_id: userId,
                    front,
                    back,
                    hint: hint || null,
                    due_date: new Date().toISOString().split('T')[0],
                    interval: 1,
                    ease_factor: 2.5,
                    repetitions: 0,
                })
                .select()
                .single()

            if (insertError) {
                console.error('[cardController] card insert failed:', insertError.message)
                continue
            }

            // Step 3d: Upsert record into Pinecone (index generates embeddings from text)
            try {
                await upsertCard(newCard.id, null, { deckId, userId, front, back })
            } catch (e) {
                console.error('[cardController] Pinecone upsert failed:', e.message)
            }

            createdCards.push(newCard)
        }

        // Step 4: Sync deck card_count
        await supabase
            .from('decks')
            .update({ card_count: createdCards.length })
            .eq('id', deckId)

        // Step 5: Return result
        res.status(201).json({
            success: true,
            cardsCreated: createdCards.length,
            cards: createdCards,
        })
    } catch (err) {
        console.error('[cardController] uploadAndGenerateCards:', err.message)
        res.status(500).json({ error: err.message })
    }
}

// GET /api/cards/:deckId
async function getCardsByDeck(req, res) {
    try {
        const { deckId } = req.params

        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('deck_id', deckId)
            .order('created_at', { ascending: true })

        if (error) throw error
        res.json(data)
    } catch (err) {
        console.error('[cardController] getCardsByDeck:', err.message)
        res.status(500).json({ error: err.message })
    }
}

// DELETE /api/cards/:cardId
async function deleteCard(req, res) {
    try {
        const { cardId } = req.params

        // Remove from Pinecone (best-effort)
        try {
            await deletePineconeCard(cardId)
        } catch (e) {
            console.error('[cardController] Pinecone delete failed:', e.message)
        }

        const { error } = await supabase.from('cards').delete().eq('id', cardId)
        if (error) throw error

        res.json({ success: true })
    } catch (err) {
        console.error('[cardController] deleteCard:', err.message)
        res.status(500).json({ error: err.message })
    }
}

module.exports = { uploadAndGenerateCards, getCardsByDeck, deleteCard }
