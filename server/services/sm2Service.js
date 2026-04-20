/**
 * SM-2 Spaced Repetition Algorithm
 * Ratings: 0=Again, 1=Hard, 2=Good, 3=Easy
 */
function calculateNextReview(card, rating) {
    let { interval = 1, ease_factor = 2.5, repetitions = 0 } = card

    switch (rating) {
        case 0: // Again
            repetitions = 0
            interval = 1
            ease_factor = Math.max(1.3, ease_factor - 0.2)
            break

        case 1: // Hard
            repetitions = repetitions + 1
            interval = Math.max(1, Math.round(interval * 1.2))
            ease_factor = Math.max(1.3, ease_factor - 0.15)
            break

        case 2: // Good
            repetitions = repetitions + 1
            if (repetitions === 1) interval = 1
            else if (repetitions === 2) interval = 4
            else interval = Math.round(interval * ease_factor)
            break

        case 3: // Easy
            repetitions = repetitions + 1
            if (repetitions === 1) interval = 4
            else if (repetitions === 2) interval = 4
            else interval = Math.round(interval * ease_factor * 1.3)
            ease_factor = ease_factor + 0.15
            break

        default:
            throw new Error(`Invalid rating: ${rating}. Must be 0–3.`)
    }

    // Due date = today + interval days (ISO date string YYYY-MM-DD)
    const due = new Date()
    due.setDate(due.getDate() + interval)
    const due_date = due.toISOString().split('T')[0]

    return {
        interval,
        ease_factor: parseFloat(ease_factor.toFixed(4)),
        repetitions,
        due_date,
    }
}

module.exports = { calculateNextReview }
