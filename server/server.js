require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { startReminderJob } = require('./services/reminderService')

const deckRoutes = require('./routes/decks')
const cardRoutes = require('./routes/cards')
const studyRoutes = require('./routes/study')

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/decks', deckRoutes)
app.use('/api/cards', cardRoutes)
app.use('/api/study', studyRoutes)

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'memorix-api' }))

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`Memorix API running on port ${PORT}`)
    startReminderJob()
})
