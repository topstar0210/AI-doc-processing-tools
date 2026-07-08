# AI Document Processing

Upload text-based PDFs, extract content, and parse structured fields with OpenAI.

## Features

- Static login (hardcoded credentials)
- PDF upload (text-based or scanned, up to 10 MB)
- Text extraction via `pdf-parse`, with OCR fallback via Tesseract.js
- AI field extraction via OpenAI (`gpt-4o-mini`)
- Results page with JSON and CSV export
- Upload history page with past extractions

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Edit `.env.local`:

- `AUTH_USERNAME` / `AUTH_PASSWORD` — login credentials
- `SESSION_SECRET` — random string for session signing
- `OPENAI_API_KEY` — your OpenAI API key

4. Start the dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

Default credentials (if not overridden): `admin` / `password123`

## Flow

```
Login → Dashboard → Upload PDF → Extract text (OCR if scanned) → AI parsing → Results (JSON/CSV export)
                                                                    ↓
                                                              History page
```

## Project structure

```
src/
  app/
    login/          # Login page
    dashboard/      # PDF upload
    history/        # Past extractions list
    results/[id]/   # Extraction results
    api/
      auth/         # Login/logout
      process/      # PDF upload + extraction
  components/       # UI components
  lib/              # Auth, PDF, OpenAI, storage
data/
  uploads/          # Stored PDFs (gitignored)
  results/          # Extraction JSON (gitignored)
```

## Notes

- Text-based PDFs use direct text extraction; scanned PDFs automatically fall back to OCR (up to 15 pages).
- OCR processing is slower than text extraction — expect longer wait times for scanned documents.
- Uploaded files and results are stored locally in `data/`.
