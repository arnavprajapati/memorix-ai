const express = require('express')
const router = express.Router()
const { getDueCards, submitRating, getStreak } = require('../controllers/studyController')

router.get('/:userId/due', getDueCards)
router.get('/:userId/streak', getStreak)
router.post('/rate', submitRating)

module.exports = router
