# Changelog — opencode Session

## 2026-05-30

### Fixed: `<button>` nested inside `<button>` (hydration error)
- **File**: `components/layout/HistorySidebarItem.tsx`
- **Problem**: Outer wrapper was `<button>` with a `Button` (shadcn) component nested inside, causing "cannot be a descendant of `<button>`" hydration error
- **Fix**: Changed outer element from `<button>` to `<div>` with `role="button"`, `tabIndex={0}`, keyboard handler (Enter/Space), and `cursor-pointer`

### Fixed: Generic "Failed to generate quiz" error hides real error
- **File**: `app/api/features/quiz/route.ts`
- **Problem**: Catch-all block returned generic `"Failed to generate quiz"` regardless of the actual error
- **Fix**: Changed to return `error instanceof Error ? error.message : "Failed to generate quiz"` so the real error surfaces

### Fixed: Quiz frontend hides errors from user
- **File**: `components/features/quiz/QuizPageClient.tsx`
- **Problem**: Error was only logged to `console.error`, invisible to user
- **Fix**: Added `error` state + red error banner above loading spinner that displays the actual error message

### Fixed: Generic catch-all errors in all feature API routes
- **Files**:
  - `app/api/features/flashcards/route.ts`
  - `app/api/features/mindmap/route.ts`
  - `app/api/features/notes/route.ts`
  - `app/api/features/revision/route.ts`
- **Problem**: Same pattern — all returned generic error messages on failure
- **Fix**: Changed each to return the real `error.message`

### Fixed: Notes streaming catch swallowed error
- **File**: `app/api/features/notes/route.ts`
- **Problem**: The inner async IIFE's catch block didn't log the error or save the real error message to the file record
- **Fix**: Added `console.error("Notes stream error:", streamError)` and saved `streamError.message` to `errorMessage`

### Fixed: Profile route `updatedAt` type mismatch
- **File**: `app/api/profile/route.ts`
- **Problem**: `updates.updatedAt` was assigned a string (`toISOString()`) but Drizzle expects `Date` for `mode: "date"` timestamp columns
- **Fix**: Changed to `new Date()` and widened `updates` type to `Record<string, string | Date>`

### Fixed: Model name `gemini-1.5-flash` returns 404
- **File**: `lib/llm/gemini.ts`
- **Problem**: Both model references used `gemini-1.5-flash` which returned 404 for the user's API key/region
- **Fix**: Updated to `gemini-3.5-flash` (2 occurrences)

### Fixed: History sidebar used mock data and showed on all pages
- **File**: `components/layout/HistorySidebar.tsx`
- **Problem**: Used static `mockHistory` array; rendered on home page, about, profile, etc. where it had no relevance
- **Fix**: 
  - Replaced mock data with `fetch("/api/history")` call on mount
  - Added `usePathname()` check — sidebar only renders on `/feature/*` pages
  - Added `onSelect` → navigates to `/feature/{feature}?historyId={id}`
  - Added `onDelete` → calls `DELETE /api/history/{id}`, removes from local state
  - Added loading spinner state

### Fixed: Download PDF button downloaded `.html` instead of `.pdf`
- **Files**:
  - `components/shared/DownloadButton.tsx`
  - `components/features/notes/NotesPageClient.tsx`
  - `components/features/flashcards/FlashcardsPageClient.tsx`
  - `components/features/quiz/QuizResults.tsx`
  - `components/features/mindmap/MindMapPageClient.tsx`
  - `components/features/revision/RevisionPageClient.tsx`
  - `app/api/export/pdf/route.tsx` (renamed from .ts)
  - `lib/pdf-templates.tsx` (new)
- **Problem**: DownloadButton generated an HTML blob and saved as `.html`. User wanted a proper `.pdf` file.
- **Fix**:
  - Created `lib/pdf-templates.tsx` with `@react-pdf/renderer` Document components for all 5 features (NotesPDF, FlashcardsPDF, QuizPDF, MindMapPDF, RevisionPDF) using proper PDF layout primitives (Document, Page, Text, View, StyleSheet)
  - Includes `parseMarkdownToPdf()` helper that converts markdown → PDF Text/View nodes (headings, lists, blockquotes, code blocks)
  - Includes `renderMindMapNodePDF()` recursive helper for mindmap tree → PDF outline
  - Includes `RevisionPDF` with 2-column layout
  - Rewrote `/api/export/pdf` route to use `pdf().toBuffer()` from `@react-pdf/renderer` to generate a real PDF binary on the server
  - Route returns `Content-Type: application/pdf` and `Content-Disposition: attachment` headers
  - Rewrote `DownloadButton` to POST data to `/api/export/pdf`, receive a PDF blob, and trigger a browser download with `.pdf` extension
  - DownloadButton now accepts `feature` enum + feature-specific data props (`content`, `flashcards`, `questions`, `mindMap`) instead of raw HTML
  - All 5 feature pages updated to pass proper data props
   - Removed now-unused `generateNotesHTML`, `generateFlashcardsHTML`, `generateQuizHTML`, `generateRevisionHTML`, `generateMindMapHTML` imports from page clients
- **Dependency**: Installed `jspdf` (no longer needed, kept for future use)

## 2026-07-16

### Fixed: Auth.js `ClientFetchError` — missing `.env.local`
- **Root cause**: No environment variables set → `NEXTAUTH_SECRET` missing → JWT encryption failed → session endpoint returned 500
- **Fix**: Created `.env.local` with `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID/SECRET`, `ENCRYPTION_SECRET`, etc. from existing `.env`

### Fixed: PostgreSQL `42703` (column does not exist) — schema column name mismatch
- **Root cause**: DB tables created with camelCase columns (`userId`, `emailVerified`) but Drizzle schema defined snake_case (`user_id`, `email_verified`)
- **Fix**: Updated all column name mappings in `lib/db/schema.ts` across `users`, `accounts`, `sessions`, `apiKeys`, `fileRecords`, `sessionsOutput` to match actual DB columns

### Fixed: PostgreSQL `23502` (NOT NULL violation) — `id` column no default
- **Root cause**: DB `id` columns were `varchar` with no default, but Drizzle's `defaultRandom()` sets a SQL-level `DEFAULT gen_random_uuid()` that was never applied to the actual DB
- **Fix**: Changed all `uuid("id").defaultRandom().primaryKey()` → `text("id").$defaultFn(() => crypto.randomUUID()).primaryKey()` across all 6 tables — generates UUID in JS before INSERT

### Removed: Google Gemini API key requirement — replaced with open-source LLMs
- **New files**: `lib/llm/groq.ts` (GroqProvider — Llama 3.3 70B), `lib/llm/huggingface.ts` (HuggingFaceProvider — Llama 3 8B), `lib/llm/registry.ts` (ProviderRegistry with fallback chain)
- **Modified**: `lib/llm/provider.ts` — added `name` property to interface
- **Modified**: All 5 feature API routes (`notes`, `flashcards`, `quiz`, `mindmap`, `revision`) — removed Gemini + apiKey decryption, now use `llm.generateJSON/Stream()`
- **Modified**: `components/profile/ApiKeyManager.tsx` — replaced key entry form with info card: "No configuration needed"
- **Modified**: `components/shared/FeatureGuard.tsx` — reduced to no-op passthrough
- **Modified**: `hooks/useApiKeys.ts` — replaced with no-op stub
- **Modified**: `lib/utils/validators.ts` — removed `API_KEY_PATTERNS` and `validateApiKeyFormat`
- **Modified**: `.env.local` — added `GROQ_API_KEY` and `HF_API_TOKEN` from existing `.env`
- **Kept**: `lib/crypto/api-key.ts`, `app/api/profile/api-keys/` routes, `api_keys` DB table — backward-compatible
- **Fallback chain**: Groq (primary) → HuggingFace (fallback) → both try sequentially on failure

### Changed: File storage from local disk → PostgreSQL (Neon)
- **New table**: `file_storage` in `lib/db/schema.ts` with `id`, `data` (base64 text), `mimeType`
- **Modified**: `lib/storage/blob.ts` — storage priority: DB (Neon) → Vercel Blob → local disk
- `uploadFile()` stores base64-encoded file bytes in DB, returns `db://<storageId>` URL
- `fetchFile()` reads from DB when URL starts with `db://`
- `deleteFile()` deletes from DB when URL starts with `db://`
- Existing local `public/uploads/` files remain accessible via HTTP fetch

### Added: Upstash Redis rate limiting
- **Dependency**: Installed `@upstash/redis` v1.38.0
- **New files**: `lib/redis.ts` (Redis client singleton, graceful null fallback), `lib/rate-limiter.ts` (sliding-window rate limiter via sorted sets with `checkRateLimit()` helper)
- **Applied**: 20 req/min per user on all 5 LLM feature routes, 10 req/hour per user on upload route
- **Behavior**: Returns 429 with `Retry-After` header when limited; gracefully passes all requests if Redis unavailable
- **Modified**: `.env.local` — added `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
