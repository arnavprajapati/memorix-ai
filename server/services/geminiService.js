const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PROMPT =
    'You are an expert teacher creating flashcards. ' +
    'Generate 20-25 high quality flashcards from this text. ' +
    'Mix of types: definitions, concepts, applications, edge cases, examples. ' +
    'NOT shallow cards. Deep understanding cards. ' +
    'For ALL mathematical expressions, variables, formulas, and equations use LaTeX delimiters: $...$ for inline math and $$...$$ for block equations. NEVER use backticks for math. ' +
    'Return ONLY a valid JSON array with NO markdown, NO explanation, NO code fences. ' +
    'Each object MUST have exactly these keys: "front" (the question), "back" (the answer), "hint" (a short hint or null). ' +
    'Example: [{"front":"What is X?","back":"X is ...","hint":"Think about Y"}]'

/**
 * Generate flashcards from PDF text using Gemini.
 * @param {string} pdfText  - extracted text from the uploaded PDF
 * @param {string} deckName - name of the deck (used as context)
 * @returns {Promise<Array<{ front: string, back: string, hint: string }>>}
 */
async function generateFlashcards(pdfText, deckName) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT,
    })

    const userPrompt =
        `Create flashcards from this content: ${deckName}\n\n` +
        pdfText.slice(0, 15000)

    const MAX_RETRIES = 4
    const BASE_DELAY_MS = 2000

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent(userPrompt)
            const raw = result.response.text().trim()

            // Strip accidental markdown code fences
            const json = raw
                .replace(/^```json?\s*/i, '')
                .replace(/```\s*$/i, '')
                .trim()

            return JSON.parse(json)
        } catch (err) {
            const is503 = err.message?.includes('503') || err.message?.includes('Service Unavailable')
            const is429 = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('Resource has been exhausted')

            if ((is503 || is429) && attempt < MAX_RETRIES) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) // 2s, 4s, 8s
                console.warn(`[geminiService] attempt ${attempt} failed (${is503 ? '503' : '429'}), retrying in ${delay}ms...`)
                await new Promise(r => setTimeout(r, delay))
                continue
            }

            console.error('[geminiService] generateFlashcards failed:', err.message)
            throw err
        }
    }
}

/**
 * Generate a text embedding vector.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/gemini-embedding-001',
                content: { parts: [{ text: text.slice(0, 2000) }] }
            })
        }
    )
    const data = await response.json()
    if (!response.ok) throw new Error(JSON.stringify(data))
    return data.embedding.values
}

module.exports = { generateFlashcards, generateEmbedding }
