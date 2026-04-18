const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, options)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`)
    }
    return data
}

// ─── Deck APIs ────────────────────────────────────────────────────────────────

export async function createDeck(name, description, userId) {
    return request('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, userId }),
    })
}

export async function getUserDecks(userId) {
    return request(`/api/decks/${userId}`)
}

export async function getDeckById(deckId) {
    return request(`/api/decks/${deckId}/detail`)
}

export async function deleteDeck(deckId) {
    return request(`/api/decks/${deckId}`, { method: 'DELETE' })
}

export async function uploadPDF(deckId, userId, deckName, pdfFile) {
    const formData = new FormData()
    formData.append('pdf', pdfFile)
    formData.append('deckId', deckId)
    formData.append('userId', userId)
    formData.append('deckName', deckName)

    return request(`/api/decks/${deckId}/upload`, {
        method: 'POST',
        body: formData,
    })
}

// ─── Card APIs ────────────────────────────────────────────────────────────────

export async function getCardsByDeck(deckId) {
    return request(`/api/cards/${deckId}`)
}

export async function deleteCard(cardId) {
    return request(`/api/cards/${cardId}`, { method: 'DELETE' })
}

// ─── Study APIs ───────────────────────────────────────────────────────────────

export async function getDueCards(userId) {
    return request(`/api/study/${userId}/due`)
}

export async function submitRating(cardId, rating, userId) {
    return request('/api/study/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, rating, userId }),
    })
}
