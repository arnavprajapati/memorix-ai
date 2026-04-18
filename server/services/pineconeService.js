const { Pinecone } = require('@pinecone-database/pinecone')

let index = null

function getIndex() {
    if (!index) {
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
        index = pc.index(process.env.PINECONE_INDEX)
    }
    return index
}

/**
 * Upsert a single card record (index uses integrated embedding).
 * @param {string} cardId
 * @param {number[]} _embedding  - unused; Pinecone generates embeddings from text
 * @param {{ deckId: string, userId: string, front: string, back: string }} metadata
 */
async function upsertCard(cardId, _embedding, metadata) {
    const idx = getIndex()
    await idx.upsertRecords({
        records: [{
            id: cardId,
            text: `${metadata.front} ${metadata.back}`,
            deckId: metadata.deckId,
            userId: metadata.userId,
            front: metadata.front,
            back: metadata.back,
        }]
    })
}

/**
 * Search for semantically similar cards scoped to a user.
 * @param {number[]} embedding - query embedding
 * @param {string}   userId   - filter results to this user
 * @param {number}   topK     - number of results to return (default 5)
 * @returns {Promise<Array>} Pinecone match objects
 */
async function searchSimilar(queryText, userId, topK = 5) {
    const idx = getIndex()
    const result = await idx.searchRecords({
        query: { inputs: { text: queryText }, topK },
        filter: { userId },
    })
    return result.result?.hits ?? []
}

/**
 * Delete a single card vector by ID.
 * @param {string} cardId
 */
async function deleteCard(cardId) {
    const idx = getIndex()
    await idx.deleteOne(cardId)
}

module.exports = { upsertCard, searchSimilar, deleteCard }
