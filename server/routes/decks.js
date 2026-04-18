const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { createDeck, getUserDecks, getDeckById, deleteDeck } = require('../controllers/deckController')
const { uploadAndGenerateCards } = require('../controllers/cardController')

router.post('/', createDeck)
router.get('/:userId', getUserDecks)
router.get('/:deckId/detail', getDeckById)
router.delete('/:deckId', deleteDeck)
router.post('/:deckId/upload', upload.single('pdf'), uploadAndGenerateCards)

module.exports = router
