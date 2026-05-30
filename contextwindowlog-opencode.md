# StudyMate AI HUB — Context Window Log

**Session Date:** May 30, 2026  
**Next.js Version:** 16.2.6 (Turbopack)  
**Node Version:** 24.15.0  
**Project Root:** `E:\ProgrammingRelatedFiles Log 2\Weekend Projects\StudyMateNextJS`

---

## Session 1 Summary (Initial Build)

Built the entire **StudyMate AI HUB** full-stack Next.js application from scratch. All phases 0–5 completed successfully (build, typecheck, lint pass with zero errors). Database schema pushed to Neon PostgreSQL.

## Session 2 Summary (Bug Fixes & Auth Setup)

Fixed authentication issues, created missing API route, configured Google OAuth.

---

## What Was Built (Total: 111 source files, 109 TypeScript/TSX)

| Layer | Files | Status |
|-------|-------|--------|
| Foundation | DB schema (7 tables), Drizzle config, NextAuth v5, proxy.ts (Next.js 16), env template | Done |
| Layout | Root layout, main layout, Navbar (responsive), HistorySidebar, Footer | Done |
| Public Pages | Home (hero + feature grid), Features overview, About Us | Done |
| Auth | Login, Register, Forgot Password pages + forms + Google OAuth button | Done |
| **Auth API** | **`/api/auth/register`** — created in Session 2 (was missing) | Done |
| Upload | FileDropzone (drag-drop), UploadProgress, FileTypeIcon, Blob storage | Done |
| Parsers | PDF (pdf-parse), DOCX (mammoth), PPTX, Image (sharp), TXT | Done |
| LLM Layer | Gemini provider, LLMProvider interface, 5 prompt templates | Done |
| Crypto | AES-256-GCM encrypt/decrypt for API keys | Done |
| Features (5) | Notes, Flashcards, Quiz, Mind Map, Revision — each with API route + page + components | Done |
| History API | GET list (feature filter), GET single, DELETE | Done |
| PDF Export | HTML generators for all 5 features, export API route | Done |
| Profile | ProfileCard, ApiKeyManager, UsageStats, API key CRUD | Done |
| Shared UI | StreamingOutput (typewriter), MarkdownRenderer, ErrorModal, FeatureGuard, buttons, spinners | Done |
| shadcn UI | 14 custom components (Button, Card, Dialog, Sheet, Slider, Select, Toast, Popover, Progress, Badge, Avatar, Skeleton, Label, Separator) | Done |
| CI/CD | GitHub Actions workflow (lint + typecheck + test) | Done |
| Database | Drizzle schema pushed to Neon PostgreSQL | Done |

---

## Session 2 Changes (Auth Fixes)

### Fixed Issues
1. **`app/page.tsx` deleted** — The default Next.js template was overriding `app/(main)/page.tsx` at the `/` route. Removed the conflicting file.
2. **`app/api/auth/register/route.ts` created** — Registration form was posting to a non-existent endpoint. Now accepts `{ name, email, password }`, validates with zod, hashes password with bcryptjs (salt rounds 12), creates user in Neon DB, returns user data.
3. **`NEXTAUTH_SECRET`** — Changed from placeholder string to a proper random 64-char hex.
4. **`AUTH_*` env vars added** — NextAuth v5 prefers `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` alongside the legacy `NEXTAUTH_*` / `GOOGLE_*` names.
5. **`trustHost: true`** added to NextAuth config — Fixes the `/api/auth/error?error=Configuration` error (NextAuth v5 requires explicit host trust).

### Auth Flow
- **Email Registration**: `POST /api/auth/register` → zod validation → bcrypt hash → DB insert → auto-sign-in via NextAuth credentials → redirect to `/feature/notes`
- **Email Login**: `signIn("credentials")` → NextAuth Credentials provider → bcrypt compare → JWT issued
- **Google OAuth**: `signIn("google")` → Google redirect → callback at `/api/auth/callback/google` → account linked/created → JWT issued

---

## Key Architecture Decisions

- **Next.js 16** with App Router, using `proxy.ts` instead of deprecated `middleware.ts`
- **Tailwind v4** design tokens defined in `globals.css` `@theme` block
- Color palette: warmOffWhite (#FAF8F4), warmAmber (#C8A96E), darkPrimary (#1C1C1E)
- Fonts: Playfair Display (serif headings), Inter (sans body), Fira Code (mono)
- **NextAuth v5** (5.0.0-beta.31) with JWT strategy, Credentials + Google OAuth providers
- **Drizzle ORM** with Neon serverless PostgreSQL via `@neondatabase/serverless`
- Passwords hashed with bcryptjs (salt rounds 12)
- API keys AES-256-GCM encrypted with `ENCRYPTION_SECRET`
- All API routes protected via `proxy.ts` matcher + NextAuth authorized callback

---

## Routes (26 total)

### Static Pages (14)
`/`, `/about`, `/features`, `/login`, `/register`, `/forgot-password`, `/profile`, `/feature/notes`, `/feature/flashcards`, `/feature/quiz`, `/feature/mindmap`, `/feature/revision`, `/_not-found`

### API Routes (12)
- `/api/auth/[...nextauth]` — NextAuth handler (signin, signout, session, callback)
- `/api/auth/register` — User registration (POST, zod validated, bcrypt hashed)
- `/api/upload` — File upload to Vercel Blob
- `/api/features/{notes,flashcards,quiz,mindmap,revision}` — AI processing (5 routes)
- `/api/history` + `/api/history/[id]` — History CRUD
- `/api/export/pdf` — PDF HTML generation
- `/api/profile` + `/api/profile/api-keys` + `/api/profile/api-keys/[id]` — User profile & API keys

---

## Build Results

```
✓ Compiled successfully
✓ TypeScript: zero errors
✓ ESLint: zero errors (7 warnings — img tags, unused vars)
✓ 26/26 static pages generated
✓ Proxy (Middleware) active
```

---

## Dependencies

**Production:** next@16.2.6, react@19.2.4, react-dom@19.2.4, next-auth@5.0.0-beta.31, @auth/drizzle-adapter, drizzle-orm, @neondatabase/serverless, @google/generative-ai, ai, @vercel/blob, lucide-react, react-dropzone, framer-motion, zod, bcryptjs, pdf-parse, mammoth, sharp, reactflow, @dagrejs/dagre, @react-pdf/renderer, html-to-image

**Dev:** tailwindcss, @tailwindcss/postcss, typescript, eslint, eslint-config-next, drizzle-kit, jest, @testing-library/react, playwright, prettier, husky, lint-staged

---

## Environment Variables (.env.local — Current State)


## To Continue Next Session

### Setup for development:
```bash
cd "E:\ProgrammingRelatedFiles Log 2\Weekend Projects\StudyMateNextJS\studymate-ai-hub"
npm run dev
```

### What's currently working:
- ✅ `/` — Landing page with hero + feature grid
- ✅ `/register` — Create account (name, email, password)
- ✅ `/login` — Email/password sign in or Google OAuth
- ✅ `/features` — Feature overview cards
- ✅ `/about` — Mission, team, tech stack
- ✅ `/profile` — Profile info (needs Google Cloud redirect URI setup to fetch avatar)
- ✅ `/api/auth/register` — Creates user in Neon DB
- ✅ `/api/auth/[...nextauth]` — NextAuth handler
- ✅ `/forgot-password` — UI page (no email backend yet)
- ✅ Feature pages at `/feature/{notes,flashcards,quiz,mindmap,revision}` — Upload + generate UI (require Gemini API key in Profile)

### What needs Google OAuth redirect URI:
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit the OAuth 2.0 Client ID
3. Add **Authorized redirect URI**: `http://localhost:3000/api/auth/callback/google`
4. (For production) Add: `https://your-domain.vercel.app/api/auth/callback/google`

### Remaining work / enhancement priorities:
1. **Set Vercel Blob token** — `BLOB_READ_WRITE_TOKEN` still placeholder
2. **File upload** — Upload endpoint uses Blob; needs real token to work
3. **Feature generation** — Requires valid Gemini API key in Profile → ApiKeyManager
4. **Streaming output** — Wire up API responses to StreamingOutput component
5. **History sidebar** — Real data integration (currently mock structure)
6. **Error modals + toasts** — Connect to real error states
7. **Testing** — Unit tests (Jest), component tests (RTL), E2E (Playwright)
8. **Responsive polish** — Test across 375px–1920px
9. **Deploy to Vercel** — Link repo, set production env vars
10. **Custom domain** (optional)

### Build commands:
```bash
npx next build        # Production build
npx next lint         # ESLint
npx tsc --noEmit      # TypeScript check
npx drizzle-kit push  # Push schema to DB
npm run dev           # Start dev server
```
