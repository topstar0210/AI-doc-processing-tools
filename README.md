# AI Document Processing

Enterprise-oriented document intelligence platform: upload PDFs, OCR when needed, vector-index content, chat with citations, and export structured JSON for downstream systems.

Built for legal and finance teams handling sensitive documents.

## Milestone 1: Chat with Documents

The core loop is live:

1. Upload one or many PDFs
2. OCR runs automatically on scanned pages
3. Embeddings are stored in **Qdrant** for fast retrieval
4. Chat UI answers questions with **page-level citations** linking back to source text
5. JSON export endpoint returns the full extracted dataset

## Quick start (local)

### 1. Start Qdrant

```bash
docker compose up qdrant -d
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Set `OPENAI_API_KEY` and other values in `.env.local`.

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — default login: `admin` / `password123`

## One-command Docker deploy

```bash
cp .env.example .env
# edit .env with real secrets
docker compose up --build
```

App: [http://localhost:3000](http://localhost:3000)  
Qdrant: [http://localhost:6333](http://localhost:6333)

## Architecture

```
Upload PDF(s)
    ↓
OCR (Tesseract.js) when text layer is missing
    ↓
Page-aware text extraction + structured field parsing (OpenAI)
    ↓
Chunking + embeddings (OpenAI text-embedding-3-small)
    ↓
Qdrant vector store
    ↓
Chat query → vector search → streamed LLM answer with citations
    ↓
JSON export API for downstream consumers
```

## API endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/documents` | `POST` | Upload one or many PDFs (multipart `files`) |
| `/api/documents` | `GET` | List indexed documents |
| `/api/chat` | `POST` | Stream chat answers with citations (SSE) |
| `/api/export/[id]` | `GET` | Full document JSON export |
| `/api/process` | `POST` | Single-file upload (legacy) |
| `/api/history` | `GET` | Upload history |

### Chat request

```json
{
  "message": "What is the total amount due?",
  "documentIds": ["uuid-1", "uuid-2"],
  "history": []
}
```

Response: Server-Sent Events stream with `citations`, `token`, and `done` events.

### Export response schema

```json
{
  "id": "uuid",
  "filename": "contract.pdf",
  "createdAt": "2026-07-08T12:00:00.000Z",
  "extractionMethod": "ocr",
  "pageCount": 42,
  "pages": [{ "pageNumber": 1, "text": "..." }],
  "structuredData": { "document_type": "contract", "..." : "..." },
  "indexedAt": "2026-07-08T12:00:05.000Z"
}
```

> Final contract schema can be swapped in post-award without changing the ingestion pipeline.

## Performance notes

| Acceptance target | Approach |
|-------------------|----------|
| Chat ≤ 2s on 100-page bundles | Indexing happens at upload; chat only embeds the query + searches Qdrant + streams LLM |
| OCR ≥ 95% accuracy | Tesseract.js at 2× render scale; upgrade path to PaddleOCR/Azure DI for production hardening |
| Enterprise licensing | MIT-friendly stack: Next.js, Qdrant (Apache 2.0), Tesseract (Apache 2.0), OpenAI API (commercial) |

## Security and logging

- Session-based auth with signed HTTP-only cookies
- Structured JSON audit logs for uploads, chat queries, and exports
- Local file storage under `data/` (swap for encrypted object storage in production)
- Secrets via environment variables only
- No document content logged — only metadata (IDs, filenames, page counts, durations)

## Project structure

```
src/
  app/
    chat/             # Chat with documents UI
    dashboard/        # Multi-PDF upload
    history/          # Past extractions
    results/[id]/     # Per-document results + page anchors
    api/
      documents/      # Batch upload + indexing
      chat/           # Streaming RAG chat
      export/[id]/    # JSON export
  lib/
    pipeline.ts       # OCR → extract → embed → store
    vector.ts         # Qdrant operations
    rag.ts            # Retrieval + streaming answers
    logger.ts         # Audit logging
docker-compose.yml    # App + Qdrant
```

## Roadmap (post–Milestone 1)

- [ ] Per-document-type extraction schemas (invoices, contracts, statements)
- [ ] Async job queue for large bundles
- [ ] SSO / RBAC for enterprise tenants
- [ ] Azure Document Intelligence OCR option
- [ ] Contract-defined JSON schema plug-in

## Development

```bash
npm run dev      # Next.js with webpack
npm run build    # Production build
npm run lint     # ESLint
```

## License stack

All core dependencies use enterprise-friendly licenses. Verify OpenAI API terms for your deployment region and data residency requirements.
