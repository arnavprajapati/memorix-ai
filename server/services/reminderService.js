const cron = require('node-cron')
const nodemailer = require('nodemailer')
const { createClient } = require('@supabase/supabase-js')

function getSupabase() {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
}

function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })
}

function buildEmailHtml(dueByDeck) {
    const rows = dueByDeck
        .map(
            ({ deckName, count }) =>
                `<tr>
                    <td style="padding:8px 16px;border-bottom:1px solid #f0f0f0;font-size:15px">${deckName}</td>
                    <td style="padding:8px 16px;border-bottom:1px solid #f0f0f0;font-size:15px;font-weight:600;color:#facc15">${count} card${count !== 1 ? 's' : ''}</td>
                 </tr>`
        )
        .join('')

    return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 0">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">

          <!-- Header -->
          <tr>
            <td style="background:#000;padding:28px 32px">
              <span style="color:#facc15;font-size:22px;font-weight:700;letter-spacing:1px">MEMORIX</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px">
              <h2 style="margin:0 0 8px;font-size:20px;color:#111">Time to review! 🧠</h2>
              <p style="margin:0 0 24px;color:#555;font-size:15px">
                You have cards waiting for you today. Keep your streak going!
              </p>

              <table width="100%" cellpadding="0" cellspacing="0"
                     style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden">
                <tr style="background:#f8f8f8">
                  <th style="padding:10px 16px;text-align:left;font-size:13px;color:#888;font-weight:600">DECK</th>
                  <th style="padding:10px 16px;text-align:left;font-size:13px;color:#888;font-weight:600">DUE</th>
                </tr>
                ${rows}
              </table>

              <div style="margin-top:28px;text-align:center">
                <a href="${process.env.FRONTEND_URL}/dashboard"
                   style="background:#facc15;color:#000;padding:13px 32px;border-radius:6px;
                          text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
                  Start Reviewing
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f0f0f0">
              <p style="margin:0;font-size:12px;color:#aaa">You're receiving this because you have an active Memorix account.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

async function sendReminderEmail(transporter, to, dueByDeck) {
    const totalCards = dueByDeck.reduce((sum, d) => sum + d.count, 0)
    await transporter.sendMail({
        from: `"Memorix" <${process.env.EMAIL_USER}>`,
        to,
        subject: `You have ${totalCards} card${totalCards !== 1 ? 's' : ''} to review today — Memorix 🧠`,
        html: buildEmailHtml(dueByDeck),
    })
}

function startReminderJob() {
    cron.schedule('0 8 * * *', async () => {
        console.log('[reminderService] Running daily reminder job...')
        const supabase = getSupabase()
        const transporter = createTransporter()

        try {
            const today = new Date().toISOString().split('T')[0]

            // Fetch all due cards with deck name and user email
            const { data: dueCards, error } = await supabase
                .from('cards')
                .select('user_id, deck_id, decks(name), users:user_id(email)')
                .lte('due_date', today)

            if (error) {
                console.error('[reminderService] Supabase query failed:', error.message)
                return
            }

            if (!dueCards?.length) {
                console.log('[reminderService] No due cards today.')
                return
            }

            // Group by user → then by deck
            const byUser = {}
            for (const card of dueCards) {
                const email = card.users?.email
                const deckName = card.decks?.name || 'Unknown Deck'
                if (!email) continue

                if (!byUser[email]) byUser[email] = {}
                byUser[email][deckName] = (byUser[email][deckName] || 0) + 1
            }

            // Send one email per user
            for (const [email, deckMap] of Object.entries(byUser)) {
                const dueByDeck = Object.entries(deckMap).map(([deckName, count]) => ({ deckName, count }))
                try {
                    await sendReminderEmail(transporter, email, dueByDeck)
                    console.log(`[reminderService] Sent reminder to ${email}`)
                } catch (e) {
                    console.error(`[reminderService] Failed to email ${email}:`, e.message)
                }
            }
        } catch (err) {
            console.error('[reminderService] Unexpected error:', err.message)
        }
    })

    console.log('[reminderService] Daily reminder job scheduled at 08:00 AM')
}

module.exports = { startReminderJob }
