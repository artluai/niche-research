# CLAUDE.md — instructions for working on this project

Read this before making any changes.

---

## What this project is

A keyword research tool for Google Ads, built on DataForSEO's API. It fetches keywords by category code, applies server-side filters to minimize API cost, and surfaces results sorted by estimated cost per conversion.

The core design insight: filters placed above the Run bar are sent to the DataForSEO API server-side (you only pay for keywords that match). Filters below the Run bar run locally in the browser for free. The drag interface makes this tradeoff visible and learnable.

Repo: https://github.com/artluai/niche-research
Tracker: https://artlu.ai (search "Keyword Pipeline")

---

## Files

```
index.html   — the entire frontend app (~2400 lines, vanilla JS, no framework)
server.js    — local CORS proxy that forwards requests to DataForSEO API
CLAUDE.md    — this file
```

That's it. No build step, no node_modules, no package.json needed. `server.js` uses only built-in Node modules.

---

## Running locally

```bash
node server.js
```

Open `http://localhost:3000`. Enter your DataForSEO API key in the API Key bar and click Save. The key is stored in localStorage — it is never in source files.

---

## Hard rules

- **Never hardcode API keys or credentials in source files.** The key goes in localStorage via the UI. `server.js` forwards whatever Authorization header the browser sends — the key never lives in code.
- **The two-file structure is intentional.** Don't introduce a build step, framework, or package.json unless there is a very specific reason that can't be solved otherwise.
- **Parity rule:** if a button or feature exists in the expanded modal view, it must also exist in the inline pipeline view. The human will catch it immediately if it doesn't.
- **Don't re-open the modal to refresh data.** When adding or removing negative keywords or applying filters, refresh in-place so the user's filter state is preserved.
- **Data-attribute pattern for onclicks:** keywords can contain apostrophes and quotes. Always use `data-*` attributes instead of string interpolation in onclick handlers.
  - Wrong: `onclick="fn('${keyword}')"`
  - Right: `data-kw="${keyword.replace(/"/g,'&quot;')}" onclick="fn(this.dataset.kw)"`

---

## Key formulas

- **$/conv** (est. cost per conversion) = `CPC ÷ CVR` — lower is better
- **conv/day** = `(volume/30) × CTR × CVR`
- Color coding: green <$20, orange <$50, purple <$150, red $150+

Industry CVR defaults: General 2%, Finance 5%, Health 3%, eCommerce 3%, Legal 4%, Education 2.5%, Travel 2%, Real Estate 2%

---

## localStorage keys

- `kw_auth` — saved API key (Basic base64 string)
- `kw_all_cats` — full 3,182 category list with d/p/b classification
- `kw_cat_selections` — saved category selections
- `kw_saved` — saved keyword searches
- `kw_neg_lists` — saved negative keyword lists
- `kw_monitor` — starred/monitored keywords

Swapping `index.html` does NOT clear localStorage — data persists by browser origin. Clearing browser data or opening in incognito WILL clear it. Always export before doing either.

---

## DataForSEO API

- Endpoint base: `https://api.dataforseo.com/v3/`
- Auth: Basic — Base64 encode `email:api_password`
- Keyword fetch: POST `/dataforseo_labs/google/keywords_for_categories/live`
- Category list: GET `/dataforseo_labs/categories` (free)
- Filters are applied server-side and reduce cost significantly — only matching keywords are returned and billed
- Cost: ~$0.02-0.03 per category with tight filters applied

See `best-practices-marketing.md` in the project knowledge base for full endpoint reference and filter syntax.

---

## What's next

Deploying as a multi-user SaaS with Firebase Auth, per-user Firestore storage, and Stripe credit-based billing. See the project tracker entry for current status.
