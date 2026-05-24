# The Abundance Shift

A manifestation coaching tool. Identity-based work, daily practice, evidence accumulation — built so the future self is the default reference point, not the old self.

**Live:** https://abundance-shift.vercel.app

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 with a warm grounded palette (terracotta · ochre · gold · charcoal)
- Fraunces serif for display · Inter for UI · JetBrains Mono for code
- Anthropic SDK for the AI Coach (Claude Sonnet 4.6)
- Deployed on Vercel, GitHub-connected for auto-deploy on push

## What's in here

- `app/(shell)/` — main app routes (dashboard, practice, coach, identity, evidence, phases, learn) wrapped by a header + left nav + persistent Future Self sidebar + always-on SOS button
- `app/onboarding/` — 5-round AI-style profiling that produces the user's belief profile
- `app/api/coach/route.ts` — Claude API route; the user's belief profile is baked into the system prompt and cached
- `app/components/` — UI primitives (PracticeFlow, CoachConversation, FutureSelfSidebar, SOSModal, QuickLog, Onboarding)
- `app/lib/mockUser.ts` — sample profile used until Supabase persistence lands

## Local development

```bash
npm install
npm run dev
```

Set `ANTHROPIC_API_KEY=sk-ant-…` in `.env.local` to wake the coach locally.

## Deployment

Pushing to `main` triggers a Vercel production build. Pull requests get preview URLs.
