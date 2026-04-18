const express = require('express')
const router = express.Router()
const { getDueCards, submitRating } = require('../controllers/studyController')

router.get('/:userId/due', getDueCards)
router.post('/rate', submitRating)

module.exports = router
