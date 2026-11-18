# Fixtures

Test fixtures for `@spinelab/core`. Two kinds live here:

- `oracle/` — trusted reference outputs (e.g. Stu Miller spreadsheet, 3Rivers
  calculator results) used to validate our models.
- `charts/` — values transcribed from published manufacturer spine charts.

## Provenance header format (required)

Every fixture file **must** begin with a provenance header — a comment block
(`#` lines) or YAML front-matter carrying these keys:

```
# fixture:   <short name>
# source:    <where the value came from — URL, document, or person>
# date:      YYYY-MM-DD   (date the value was captured)
# method:    <how it was captured — manual-copy | scraped | computed>
# tolerance: <acceptable deviation, e.g. ±0.5# or ±0.5%>
```

Rules:

- `source` must be specific enough for someone else to re-verify the value
  (full URL + calculator settings, or document + edition).
- `date` is when _we captured it_, not when the source was published.
- `tolerance` is mandatory: a fixture without a stated tolerance cannot be
  asserted against in tests.
- Factual specs only — never copy vendor databases wholesale (per
  `phase-2-build-lab` provenance policy).
