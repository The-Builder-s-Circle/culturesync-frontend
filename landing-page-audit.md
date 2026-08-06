# CultureSync Landing Page Audit

**Date:** 2026-08-06
**Scope:** `/` landing page (`src/pages/LandingPage.tsx` + `src/components/landing/*`) plus supporting files (`index.html`, `src/index.css`, routing, `package.json`).
**Method:** Reviewed against the `copywriting`, `cro`, `seo-audit`, `ai-seo`, `schema`, `content-strategy`, and `design-taste-frontend` skill frameworks; verified every claim against source with `file:line` evidence.

---

## 1. Executive Summary

The page is **visually strong and well-crafted**: a distinctive split hero, live DOM dashboard preview, disciplined indigo/slate design system, generous motion with correct reduced-motion handling, single H1 with a clean heading hierarchy, and varied section layouts (no templated repetition).

However, it is not launch-ready. The four blocking themes are:

1. **Trust/legitimacy** - the page presents invented logos, invented testimonials, and unsourced stats as real social proof ("Real stories from HR teams...", "3,400+ organizations", "including"). Per the copywriting skill: *"Fabricated statistics or testimonials erode trust and create legal liability."* This is the highest-risk finding, not an SEO one.
2. **Funnel / CTA integrity** - several CTAs lie about their destination: "Book a demo" scrolls to "How it works", "Talk to our team" links to `#pricing`, Enterprise "Talk to sales" goes to a login page, and every primary CTA routes to `/login` (which is itself a stub: `src/pages/LoginPage.tsx:6`).
3. **SEO / discoverability** - placeholder `<title>culturesync-frontend`, no meta description, no OG/Twitter tags, no canonical, no `robots.txt`, no sitemap, and zero JSON-LD (despite a 6-question FAQ that should carry `FAQPage` schema).
4. **Dependency / CI** - `react-router-dom@7.18.2` is inside the vulnerable range (GHSA-qwww-vcr4-c8h2, fix 8.2.1+), the CI workflow pins Node 20 while Vite 8 requires Node ≥22.18, and `npm run build` fails on a pre-existing `csstype` TS1010 typecheck error.

**Scores (5 = launch-ready):**

| Discipline | Score | Notes |
|---|---|---|
| Visual design / motion | 4.5 | Strong; minor taste violations (marquee count, hero padding) |
| Copy & messaging | 3.0 | Good voice; fabricated social proof is the risk |
| Conversion (CRO) | 3.0 | Good CTA cadence; destination mismatches + no auth |
| SEO & AI-SEO | 1.5 | Head/meta/schema/robots all missing |
| Accessibility | 3.5 | Reduced-motion handled well; contrast + accordion gaps |
| Performance | 3.0 | LCP fine; 136KB gzip JS single chunk; font blocking |
| Dependency health | 1.5 | Vulnerable router, Node version, typecheck break |

---

## 2. Conversion (CRO)

### 2.1 Strong points
- One clear primary action per section with repeated CTAs at decision points (hero, pricing, final CTA, footer).
- Pricing: recommended plan is visually dominant ("Most popular", dark card), annual is the default toggle, savings badge present, risk reversal ("No credit card required" appears in pricing + final CTA).
- Objection handling via a solid 6-question FAQ (`FAQ.tsx:1-39`).
- Benefit-led copy with specific claims ("cut to two weeks", `Testimonials.tsx:21`).

### 2.2 Findings

**[High] CTA destination lies about intent**
- "Book a demo" scrolls to `#how-it-works` (`Hero.tsx:328-332`). A demo is a scheduled call, not a content section. Either route to a real booking (Calendly/contact) or relabel the button "See how it works".
- "Talk to our team" in the FAQ links to `#pricing` (`FAQ.tsx:109-115`). Should be `mailto:` or a contact path.
- Enterprise plan "Talk to sales" goes to `/login` (`Pricing.tsx:57` + card CTA wiring). A sales intent landing on a login page is a dead end.
- All primary CTAs ("Start free", "Start free trial") route to `/login` rather than a signup/registration page. If this is a prototype, fine; if not, the conversion path does not exist yet.

**[Medium] CTA copy is weak by value-copy standards**
- "Start free" (copywriting skill: prefer outcome framing like "Start my free trial"); "Talk to sales" is acceptable but the destination must be fixed.
- FinalCTA uses "Start free" + "View pricing" - consistent with the rest of the page (good: one label per intent).

**[Medium] No email/lead capture on page**
- All conversions funnel to the (stub) login. No demo form, no newsletter, no waitlist - there is no way to convert a visitor who is "still researching" (see homepage CRO guidance: handle both "ready to buy" and "still researching").

**[Low] No urgency or guarantee**
- For B2B SaaS a money-back guarantee or a time-boxed offer is optional, but a "14-day free trial" claim appears in pricing copy while the actual flow is a login stub - the promise and the reality diverge.

### 2.3 Quick-win copy alternatives
- Primary CTA: **"Start my free trial"** (outcome + action) or **"Get started free"** - pick one label and reuse it across hero, pricing, and final CTA (currently "Start free" / "Start free trial" vary slightly).
- Secondary CTA (hero): relabel **"See how it works"** unless you ship a real booking link, then keep "Book a demo".

---

## 3. Copy & Messaging / Trust

### 3.1 Strong points
- Hero H1 is specific and benefit-led: "Your people. One workspace. From day one."
- Voice is confident, jargon-light, customer-language ("appraisals", "leave", "HR settings").
- Subhead is ~18 words - inside the 20-word ceiling.

### 3.2 Findings

**[Critical] Fabricated social proof presented as real**
- LogoWall: `LogoWall.tsx:15-26` defines invented companies (Northwind, Vantage Labs, Brightpath, Orbital, Summit & Co, Evergreen, Hexad, Fortress, Atlas Group, Nimbus) and renders them as **text wordmarks + generic Tabler icons**, while the headline claims "Powering HR at 3,400+ organizations, **including**" (`LogoWall.tsx:33-34`) - "including" implies these are real named customers.
- Testimonials: invented named executives (Ada Obi - VP People Brightpath, Tunde Bakare, Lena Park - Orbital, Kofi Mensah - Northwind, Chioma Eze - Atlas Group, Sam Idris - Summit & Co) under the heading "Real stories from HR teams who made the move" (`Testimonials.tsx:74`).
- StatsBand: "3,400+ organizations / 680K+ employees / 99.9% uptime / 4.9/5" (`StatsBand.tsx:53`) with no source, no date, no methodology.
- Hero avatar row: "+3.4k", "Rated 4.9 out of 5", "Trusted by 3,400+ HR teams" (`Hero.tsx:339-362`).

This is the design-taste skill's "fake-precise numbers" and the copywriting skill's "honest over sensational" failure. **Action required before launch:** either (a) replace with real logos/testimonials/stats, or (b) relabel as placeholder/example content ("Sample data", "Illustrative"), or (c) remove. Unlabeled invented testimonials are a legal liability under consumer-protection rules in many jurisdictions.

**[Medium] Inconsistent numbers phrasing**
- "3,400+ HR teams" (hero) vs "3,400+ organizations" (LogoWall/StatsBand). Pick one entity ("organizations" or "companies" or "teams").

**[Medium] Pricing math contradiction**
- Growth: $8/month → $6/month annual = **25%** discount (0.75x), but the toggle badge says **"Save 20%"** (`Pricing.tsx:138-139`). A visible arithmetic inconsistency is exactly the kind of detail that erodes trust in a pricing page. Fix the badge to 25% (or change the multiplier).

**[Low] Pricing units ambiguity**
- Prices render "$6 / user / month" with the annual toggle active (`Pricing.tsx:97-99`). Recommend clarifying "billed annually" so $6/user/mo does not read as a monthly-charged price. (Also relevant to AI-SEO `pricing.md` below.)

---

## 4. SEO

### 4.1 Findings

**[Critical] No title or description**
- `index.html:7` `<title>culturesync-frontend</title>` - placeholder. No meta description. This is the single most damaging SEO issue; the page cannot rank or present well in the SERP.
- Recommended title (~55 chars): `Multi-Tenant HR Platform | CultureSync` (keyword-first).
- Recommended description (~155 chars): `CultureSync brings employees, goals, appraisals, leave, and performance into one workspace. Set up onboarding in minutes. Start free.`

**[High] Missing social + canonical head tags**
- No Open Graph (`og:title/description/image/url/type`), no `twitter:card`, no `canonical`, no `theme-color`. Every link shared to LinkedIn/X/Slack will render with a bare URL.

**[High] No robots.txt / sitemap**
- Neither exists in `public/`. The seo-audit and ai-seo skills both require `robots.txt` (check AI crawlers are NOT blocked: `GPTBot`, `PerplexityBot`, `ClaudeBot`, `anthropic-ai`, `Google-Extended`) and an XML sitemap.

**[Medium] Anchor links used for in-page nav**
- `#features` / `#how-it-works` / `#pricing` / `#faq` are plain anchors (`Navbar.tsx:11`, `Footer.tsx:10-13`). Fine on the SPA, but verify the router + scroll restoration handles deep links to `/#pricing` on load (content is JS-rendered, so a crawler fetches no server HTML - see AI-SEO note below).

**[Low] Keyword presence is good, structure is missing**
- The copy already covers the core topic cluster (multi-tenant HR, onboarding, performance reviews, leave, people analytics) - the SEO gap is entirely in the head/plumbing, not the content.

### 4.2 Schema (structured data) - currently zero
No `application/ld+json` anywhere in the SPA. Recommended `@graph` on the landing page:
- `Organization` (name, url, logo `/favicon.svg`, `sameAs` socials, contactPoint).
- `WebSite` (name, url, potentialAction search).
- `SoftwareApplication` (name, applicationCategory `BusinessApplication`, `offers` mirroring real pricing, operatingSystem "Web").
- `FAQPage` (`FAQ.tsx:1-39` maps 1:1 to `mainEntity` Q&A pairs - free rich result + AI-SEO boost).
- `AggregateRating` only if real ratings exist (do not attach to the fabricated 4.9/5).

Per the schema skill: JSON-LD in the `<head>` of `index.html` is simplest for a static shell; since this is a React SPA with client routing, a small component injecting `<script type="application/ld+json">` per route (or static JSON-LD in `index.html` for the landing route) is the pragmatic approach. Validate with the Rich Results Test.

### 4.3 AI-SEO
- **Blocking:** content renders entirely client-side. AI crawlers and agents that don't execute JS may see a blank page. The ai-seo skill is explicit: "Hide your main content behind JS that doesn't render" loses both core Search and AI agents. Consider static prerendering of `/` (e.g., `vite-plugin-ssr`/SSG, or at minimum SSR for `/`, `/login`, `/dashboard`).
- **Missing machine-readable files:** add `/pricing.md` (structured per-tier pricing; note the pricing-page caveat in 4.1), `/llms.txt` (what the product is, who it's for, links incl. pricing), and ensure `robots.txt` allows AI bots.
- **Extractable structure:** the FAQ is the best AI-citation surface; `FAQPage` schema + a `/pricing.md` gives Perplexity/ChatGPT/agents parseable facts. Statistics should carry sources/dates (currently none exist - see 3.2).

---

## 5. Design, UX & Accessibility

### 5.1 Design (design-taste-frontend review)

**Passes:** single design system (Tailwind + Motion + Tabler icons - an allowed family); one accent (indigo) locked across the whole page; one corner-radius language (rounded-2xl cards / full-pill buttons/inputs); varied section layout families (split hero, stats band, vertical journey timeline, bento grid, step list, testimonial marquee, pricing cards, split FAQ, full-bleed CTA, dark footer) - no layout repetition; no version footers, no locale strips, no scroll cues, no section-numbering eyebrows (4 eyebrows across 11 sections = at/under the 1-in-3 cap); split hero (not centered) with the logo wall correctly placed BELOW the hero; reduced-motion honored (see 5.3).

**Fails / minor:**
- **[Low] Marquee overuse** - 3 marquees on one page: LogoWall (`LogoWall.tsx:40`), Testimonials row 1 (`Testimonials.tsx:79`) and row 2 (`Testimonials.tsx:84`, reverse). The skill caps marquees at 1/page. Recommend keeping one (the logo wall) and converting testimonials to a static 2x3 grid or a pause-on-hover carousel.
- **[Low] Hero top padding** `pt-32/pt-36/lg:pt-40` (`Hero.tsx:268`) exceeds the 6rem (pt-24) cap; combined with the sub-CTAs avatar/rating row, the hero is denser than the taste target.
- **[Low] Social-proof avatar row inside the hero** (`Hero.tsx:335-363`) - the skill's hero stack discipline bans a trust micro-strip + avatar row in the hero (it belongs directly below, which is where the logo wall already lives). Movable or acceptable-at-your-discretion; flagging for consistency.
- **[Low] Hero dashboard preview is a hand-built DOM mock** (`Hero.tsx:366`, `DashboardPreview`) with fake-precision data ("Tuesday, May 12", "2 minutes ago", "4 workspaces active"). Allowed as a "real component preview" pattern, but the unlabeled fake data compounds the 3.2 trust finding. Add an "Illustrative preview" caption or relabel.
- **[Low] Em-dash usage** - 19 `—`/`–` across copy (e.g., `Testimonials.tsx:21,27,74`, `FeatureBento.tsx:80,162,278`, `FAQ.tsx:12,28,32`, `Hero.tsx:314`, `HowItWorks.tsx:28`, `OnboardingJourney.tsx:25,33,49,70-71`, `FinalCTA.tsx:38`). The design-taste skill bans them outright; at minimum audit for intentionality.
- **[Low] Content overlap** - `OnboardingJourney` (4-step "what a new org experiences") and `HowItWorks` (3-step setup) cover adjacent territory. Either merge or sharpen the division of labor to avoid "two how-it-works sections".

### 5.2 Accessibility

**Passes:** single `h1` + logical `h2`/`h3` hierarchy; focus-visible rings on buttons (`Button.tsx`, `focus:ring-indigo-500`); `aria-label` on star rating (`Hero.tsx:350`) and FAQ accordion buttons; decorative icons marked `aria-hidden`; marquee pauses on hover (`hover:[animation-play-state:paused]`); `<figure>`/`<blockquote>`/`<figcaption>` in testimonials; no image `alt` debt (no `<img>` on the page).

**Fails / gaps:**
- **[Medium] Low-contrast microtext** - `text-slate-400` (#94a3b8 ≈ 3.0:1 on white) fails WCAG AA for normal text and is used at 10-11px: `Hero.tsx:27,60,122,154,209,242,259`, `LogoWall.tsx:44`, `OnboardingJourney.tsx:122`. Bump to `text-slate-500/600` (≥4.5:1). (Footer `text-slate-400` on `slate-950` is ≈7:1 - fine.)
- **[Medium] FAQ accordion lacks ARIA wiring** - buttons expose `aria-expanded` (`FAQ.tsx`) but no `aria-controls`/`id` pairing, and the panel isn't announced. Add `id`/`aria-controls` + `region`/`aria-labelledby` for robust SR behavior.
- **[Low] Navbar mobile menu** - confirm Escape-to-close and focus return; verify it against reduced-motion (drawer is presumably transition-based).
- **[Info] Reveal animations** - `initial={{opacity:0}}` content is DOM-present (crawlable/SR-readable) and `useReducedMotion()` gates it (`primitives.tsx:30`); good. Counters also respect `useReducedMotion` (`StatsBand.tsx:16`).

### 5.3 Performance

- **LCP:** Good - the LCP element is hero text/DOM, no hero image. Fonts are the main risk.
- **[Medium] Render-blocking Google Fonts via CSS `@import`** (`index.css:1`) - 3 families (Inter 300-800, JetBrains Mono 400/500, Plus Jakarta Sans 500-800), no `preconnect`, no subsetting. Move to `<link rel="preconnect">` + `<link>` (or self-host with `font-display: swap`), and trim weights to what's used (the display font only needs 700/800).
- **[Medium] Single JS chunk** - 436KB (136KB gzip) in one bundle; no `React.lazy()`/`Suspense` anywhere. `/login` and `/dashboard` (plus Motion itself) are all in the first-paint payload. Route-split `/login` and `/dashboard`.
- **[Low] CSS marquees are GPU-friendly** (transform-based, `w-max` duplicated lists) - fine.
- **[Low] Bundle contents** - verify `@tabler/icons-react` tree-shaking is working (imports are per-icon, so it should be); the 136KB is dominated by React + react-router + Motion, which is why code-splitting matters.

---

## 6. Dependency / CI Health (context for a green build)

1. **[Critical] `react-router-dom@7.18.2` vulnerable** (GHSA-qwww-vcr4-c8h2, high: RSC Mode CSRF Bypass; affects 7.12.0 - 8.2.0). No safe 7.x exists; fix is `8.2.1+` (breaking major). Current usage is declarative-only (`Link`, `Outlet`, `useNavigate`, `Routes`, `Route`, `Navigate` in `src/main.tsx` / `src/Routes/index.tsx`), so the 8.x upgrade path is low-risk. `.github/workflows/build.yml` runs `npm audit --audit-level=high`, which is what fails CI today. **Decision needed:** upgrade to `react-router-dom@^8.2.1` (recommended) or relax the audit gate until a 7.x patch ships.
2. **[High] CI Node version vs Vite 8:** workflow pins Node 20 (`ubuntu-latest`, node-version 20) but installed `vite@8` requires `^22.18.0 || >=24.11.0` - the CI `npm run build` step will fail on Node 20 regardless of the audit step. Bump the workflow to Node 24 (or pin a compatible Vite).
3. **[High] `npm run build` fails on `csstype` TS1010** (`node_modules/csstype/index.d.ts(10090,120): error TS1010: '*/' expected`) - a pre-existing typecheck break. `npx vite build` succeeds (Rolldown, 6649 modules) but the `tsc -b && vite build` script is a red herring for verification. Pin a known-good `csstype` version or exclude it from the typecheck until the upstream fix lands.

---

## 7. Prioritized Action Plan

### Critical (do before anything else)
1. **Fix fabricated social proof** - real logos/testimonials/stats, or explicit "Sample/Illustrative" labeling, or removal. Touch: `LogoWall.tsx`, `Testimonials.tsx`, `StatsBand.tsx`, `Hero.tsx` (avatar/rating/`+3.4k`).
2. **Fix CTA truthfulness** - "Book a demo" destination, "Talk to our team", Enterprise "Talk to sales", and decide whether `/login` is signup or a stub.
3. **Head/meta** - title, meta description, OG/Twitter, canonical, theme-color in `index.html`.
4. **Dependency decision** - router upgrade to 8.2.1+ or audit-gate change; CI Node bump; csstype pin.

### High impact
5. **JSON-LD** - Organization + WebSite + SoftwareApplication + FAQPage `@graph` on the landing route.
6. **`robots.txt` + sitemap.xml** (allow AI bots; list `/`, `/login`).
7. **Code-split** `/login` and `/dashboard`; move fonts to `<link>` + preconnect and trim weights.
8. **Contrast pass** on `text-slate-400` microtext (→ slate-500/600).
9. **FAQ accordion ARIA** (`id`/`aria-controls`).

### Quick wins
10. Pricing badge "Save 20%" → "Save 25%" (or change the multiplier).
11. Unify "3,400+ HR teams" vs "3,400+ organizations".
12. Add "billed annually" to the annual price unit.
13. Relabel hero secondary CTA or wire a real demo path.
14. Trim to one marquee; static-grid the testimonials.
15. Em-dash sweep (19 occurrences) if you adopt the taste rule.
16. `/pricing.md` + `/llms.txt` for AI agents.

### Long term
17. SSR/prerender the landing route (client-side-only rendering is the biggest structural AI-SEO + resilience gap).
18. Real `LoginPage`/`DashboardPage` implementations (currently stubs - `LoginPage.tsx:6`, `DashboardPage.tsx:5`).
19. Newsletter/demo-capture surface for research-stage visitors.

---

## 8. Evidence Index (key `file:line`)

| Finding | Location |
|---|---|
| Placeholder title | `index.html:7` |
| Fonts via CSS @import | `src/index.css:1` |
| Hero avatar/rating/trust strip | `src/components/landing/Hero.tsx:335-363` |
| Hero "Book a demo" → #how-it-works | `src/components/landing/Hero.tsx:328-332` |
| Hero top padding | `src/components/landing/Hero.tsx:268` |
| Invented logos + text wordmarks | `src/components/landing/LogoWall.tsx:15-26, 33-34` |
| Fabricated stats | `src/components/landing/StatsBand.tsx:53` |
| "Real stories" + invented testimonials | `src/components/landing/Testimonials.tsx:21-27, 74` |
| Two testimonial marquees | `src/components/landing/Testimonials.tsx:79, 84` |
| Pricing math: Save 20% vs $8→$6 | `src/components/landing/Pricing.tsx:39-40, 138-139` |
| "Talk to our team" → #pricing | `src/components/landing/FAQ.tsx:109-115` |
| FAQ accordion (no aria-controls) | `src/components/landing/FAQ.tsx:119-129` |
| Footer dead links (`#`) | `src/components/landing/Footer.tsx:19-47` |
| No lazy()/Suspense | all of `src` (grep: 0 matches) |
| React-router vuln | `package.json` (react-router-dom ^7.18.2) |
| CI Node 20 + audit gate | `.github/workflows/build.yml` |
| csstype TS1010 | `node_modules/csstype/index.d.ts:10090` |

---

*Report generated from a full source audit. Scores and severities are relative to the frameworks cited above, not to any external benchmark.*
