# MEMORIX

**Live → [https://memorix-ai.vercel.app](https://memorix-ai.vercel.app)**

Upload any PDF. AI generates flashcards. Spaced repetition tells you when to review.

---

## What it does

1. Upload a PDF → Gemini AI reads it → 20–25 flashcards generated
2. Each card embedded in Pinecone (duplicate detection) + saved to Supabase
3. Study session: flip card → rate Again / Hard / Good / Easy
4. SM-2 algorithm schedules next review based on your rating
5. Daily 8 AM email reminder with due cards per deck

---

## Tech Used

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Supabase Auth
- KaTeX — math/LaTeX rendering in flashcards

**Backend**
- Node.js + Express
- pdf-parse — PDF text extraction (memory buffer, no disk)
- Gemini 2.5 Flash — flashcard generation
- gemini-embedding-001 — 768-dim semantic vectors
- Pinecone — vector DB for duplicate detection
- Supabase PostgreSQL — cards, decks, study_logs with RLS
- node-cron + nodemailer — daily 8 AM email reminders

**Deployed on**
- Frontend → Vercel
- Backend → Render
- Database → Supabase
- Vector DB → Pinecone