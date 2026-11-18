# Phase 4 — Traffic & Income

> Ships only after phases 1–3 are genuinely good (quality first — standing rule). Traffic is earned by the tool + content.

## 01 — SEO content layer (the link magnet)
**Assignee:** 🟣 S drafts → 🔵 H+S review | **Hours:** 8h (writing, not code)
Guides that earn links and rank for the long-tail: "Why arrow spine charts disagree" (we have the data — the cross-check mode IS the article), "AMO vs ASTM spine conventions explained", "Traditional arrow building guide", "Dynamic vs static spine". Each links to the calculator with a pre-filled URL (shareable-setup feature does the heavy lifting). Honest, cited, no gear-hype (Hayden's voice).
**Acceptance:** each guide has unique metadata, pre-filled calculator links, and a sources section.

## 02 — Affiliate integration
**Assignee:** 🟠 S→K (frontend) + 🟢 H accounts | **Hours:** 3h
3Rivers in-house affiliate (5%, monthly — verify terms + apply 🟢H); Lancaster "The Archery Program" (verify); Amazon Associates fallback. Component/build results carry "where to buy" links (FTC/AU disclosure line included). NEVER inside the working panel — trust is the product.
**Acceptance:** links tagged + disclosure present; no affiliate links in calculation outputs.

## 03 — PWA offline + performance polish
**Assignee:** 🟠 S→K (frontend) | **Hours:** 3h
Installable, offline-capable (workshop reality: no signal). Cache strategy for static assets + core computation bundle.
**Acceptance:** full calculator usable in airplane mode; Lighthouse PWA pass.

## 04 — Analytics + iteration loop
**Assignee:** 🟣 S | **Hours:** 2h
Privacy-friendly analytics (traffic-gated monetisation decisions need numbers). Track calculator completions + guide→tool funnels. Dashboard note in _sagemem.
**Acceptance:** numbers verified by reading back after install (external-state verification).

**Monetisation gates (honesty clause):** ads only after ~10k sessions/mo (Journey by Mediavine) and only on content pages; revisit at 50k (Mediavine). Revenue expectation: month 6+.
**Dependencies:** 01–03 parallel; 04 after 01.
