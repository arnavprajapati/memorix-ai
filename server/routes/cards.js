const express = require('express')
const router = express.Router()
const { getCardsByDeck, deleteCard } = require('../controllers/cardController')

router.get('/:deckId', getCardsByDeck)
router.delete('/:cardId', deleteCard)

module.exports = router
