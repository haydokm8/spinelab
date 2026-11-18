# Runsheet 05 — Deploy + SEO Fundamentals

> Phase 1, T5, Owner 🟣 S + 🟢 H, ~2h, depends on T4 (domain prep runs in parallel from day 0)

## Objective
Put the site on the public internet with the SEO foundations a traffic-attracting tool needs.

## Steps
1. 🟢 H purchases domain (D2 decision) — recommended new .com
2. Create dedicated Firebase project (e.g. `arrowcalc-<id>` — separate project per Hayden's rule), Firebase Hosting
3. Deploy `astro build` output; staging + production channels; custom domain + SSL wiring
4. SEO: unique title/meta per page, OpenGraph, sitemap.xml, robots.txt, canonical URLs, clean URL structure (`/calculator`, `/guides/...`)
5. Publish docs pages (about the math / sources) linked from the footer — transparency is the trust + link-building play
6. Verify: PageSpeed Insights, mobile rendering, share-card preview (Slack/Discord unfurl)

## Acceptance Criteria
- [ ] Production URL live on custom domain with valid SSL
- [ ] sitemap.xml + robots.txt present and submitted-ready
- [ ] Share unfurl renders correctly
- [ ] PageSpeed mobile ≥ 90
- [ ] 🔵 H+S: final walkthrough before announcing anywhere

## Notes
- This is the ONLY phase-1 task that deploys.
- Cloudflare: if the domain sits behind Cloudflare, remember the cache-purge lesson from Twin City Bowmen (purge after any robots.txt/headers changes).
- Analytics deliberately NOT added here (no bloat until Phase 4 decision).
