# CivicGuard — Frontend (Landing + Government Dashboard)
### Prompt for Antigravity

Copy everything below as-is. This is the complete, final spec — design tokens, site map, every
screen, and the exact backend contract to integrate against. Do not deviate from the architecture
decisions below.

---

## 0. What you're building

A single React + Vite app with two zones:

1. **Public landing page** (`/`) — marketing site for the CivicGuard citizen Android app. Not
   behind any login. Includes an APK download CTA.
2. **Government dashboard** (`/governmentdashboard`) — login-gated. Two experiences behind the
   same gate: **admin** (full access + can create team accounts) and **team members**
   (control_room / department_officer / field_team roles, scoped to their own work).

This is a **marketing site bolted onto an internal tool**, not a SaaS product site — keep that
distinction in mind: the public zone sells the citizen app, the gated zone is a working
command-center UI, not more marketing.

## 1. Design system — use exactly these tokens, no invented colors/spacing

Full token set (colors, typography, spacing, radius, components) is provided in the attached
`DESIGN-coinbase.md` file — treat it as authoritative. Import/recreate every token exactly:
`{colors.*}`, `{typography.*}`, `{spacing.*}`, `{rounded.*}` as Tailwind CSS v4 theme values (via
`@theme` in your CSS, since this project uses the Tailwind v4 Vite plugin — `@tailwindcss/vite`,
**not** the old `tailwind.config.js` PostCSS setup).

**Two adaptations to make, since the reference system is a crypto exchange and this is a civic
platform:**

- **Font substitution is already specified in the reference doc** — use Inter (weight 400/600/700)
  in place of CoinbaseDisplay/CoinbaseSans, and JetBrains Mono in place of CoinbaseMono. Do not
  license or fake the real Coinbase fonts.
- **`{colors.primary}` (#0052ff) stays as CivicGuard's primary action color** — a confident blue
  reads as trustworthy/institutional for a government platform too, no change needed there.
- **New tokens needed, not in the reference doc — add these, following the same naming
  convention:**
  ```yaml
  severity-critical: "#cf202f"   # reuse semantic-down red
  severity-high: "#f4780a"       # new — distinct from accent-yellow
  severity-medium: "#f4b000"     # reuse accent-yellow
  severity-resolved: "#05b169"   # reuse semantic-up green
  ```
  Use these exactly like `{colors.semantic-up}`/`{colors.semantic-down}` are used in the
  reference — text-color only on badges/labels, never as a large background fill, consistent with
  the system's "Don't use trading green/red as a button background" rule extended to severity
  colors.

**Component reuse mapping** (reference component → what it becomes here):
| Reference component | Used for in CivicGuard |
|---|---|
| `hero-band-dark` | Landing page hero |
| `product-ui-card-dark` | Floating phone/app-screenshot mockups in the hero |
| `feature-card` | "How it works" steps, feature highlights |
| `badge-pill` | Hazard category tags (POTHOLE, FLOODED ROAD, etc.) and severity badges |
| `asset-row` + `number-display` typography | Incident list rows in the dashboard — category +
  location left, report count + confidence in mono numerals right, severity as a colored badge
  instead of a green/red price cell |
| `pricing-tier-card` | **Not used** — no pricing page in this app |
| `cta-band-dark` | Pre-footer "Download the app" band on the landing page |
| `footer-light` | Same, site footer |
| `text-input`, `search-input-pill` | Dashboard forms and the incident-list filter bar |

## 2. Site map

```
/                              Public landing page
/governmentdashboard           Login (redirects here if not authenticated)
/governmentdashboard/home      Post-login: command center map + summary (admin + all team roles)
/governmentdashboard/incidents             Incident list
/governmentdashboard/incidents/:id         Incident detail
/governmentdashboard/teams                 Team status (read-only list)
/governmentdashboard/users                 Admin-only: create/manage team accounts
/governmentdashboard/alerts                Alert broadcast + active alert list
/governmentdashboard/predictions           Risk hotspot list
/governmentdashboard/analytics             Analytics summary
```

Role-based access within `/governmentdashboard/*`:
- **admin**: every route above
- **control_room**: home, incidents, teams, alerts, predictions, analytics — no `/users`
- **department_officer**: home, incidents (filtered to their department), analytics — no
  `/users`, no `/alerts` broadcast (can view alerts, not create them)
- **field_team**: a different, simpler view — do NOT reuse the full dashboard shell for this role,
  see §5

## 3. Landing page — full section spec

Following the reference's dark/light band rhythm (`hero-band-dark` → light band → light band →
`cta-band-dark` → `footer-light`):

1. **`top-nav-on-dark`** over the hero: CivicGuard wordmark left, nav links (How it works /
   Features / For Government — this last one scroll-links or routes to
   `/governmentdashboard`, styled subtly, not as a prominent CTA), a single `button-pill-cta`
   right: "Download the app"
2. **`hero-band-dark`**: `display-mega` headline (e.g. "Report it. Track it. Fixed."), `body-md`
   subhead explaining the app in one sentence, two CTAs (`button-pill-cta` "Download for Android",
   `button-outline-on-dark` "See how it works"). Layered `product-ui-card-dark` mockups showing
   2-3 app screenshots at a slight rotation, per the reference's signature pattern.
3. **Light band — "How it works"**: 4-step `feature-card` grid (3-up desktop, per reference grid
   rules), photo/icon + short copy per step: report with photo+GPS → AI detects the hazard →
   officials verify and dispatch → you're notified when resolved.
4. **Light band — Feature highlights**: 3-up `feature-card` grid: real-time hazard map, AI
   detection with confidence score, safety alerts. Each card gets a `badge-pill` label and
   `title-md` heading.
5. **`cta-band-dark`**: centered "Take back your streets" headline (`display-lg`), one CTA —
   the same Download button, repeated as a closing action per the reference's pre-footer pattern.
6. **`footer-light`**: standard 6-column link footer. One column can be minimal/placeholder (About,
   Contact, Privacy) since this isn't the focus. Do not put a prominent "Government Login" link in
   the main footer columns — place it small, in the legal-band strip at the very bottom instead,
   consistent with §0's note that this isn't meant to be a public-facing CTA.

**APK download**: the button should link to a static URL — leave it as a placeholder constant
(`const APK_DOWNLOAD_URL = "REPLACE_ME"`) at the top of the component, clearly commented, since
the actual file will be hosted externally (Cloudinary or a GitHub release) and provided later.

## 4. Government dashboard — screens

**Login** (`/governmentdashboard`): centered card on a plain canvas (not the dark hero treatment —
this is a utility screen, not marketing), `text-input` fields for email/password, `button-primary`
submit. On success, route based on role: field_team → `/governmentdashboard/field`, everyone else
→ `/governmentdashboard/home`.

**Dashboard shell** (wraps every post-login page except field_team): left sidebar nav
(`surface-soft` background, icons + labels), top bar with the logged-in user's name/role and a
logout button. Sidebar links shown are role-filtered per §2.

**Home** (command center): full-width map (Leaflet, OSM tiles — matches the backend's own
geo/routing stack, keep consistency), markers colored by the new severity tokens from §1, a
summary strip of `number-display`-styled stat cards above the map (active incidents, critical
count, teams available) pulled from `GET /api/admin/analytics/summary`.

**Incidents list**: `search-input-pill` + filter chips (status, severity, category, ward,
department — matching the backend's actual query params) above an `asset-row`-styled table.
Calls `GET /api/admin/incidents` with the selected filters as query params.

**Incident detail**: photo, AI-detected category as a `badge-pill`, confidence as a mono number,
map pin, report count, action buttons (`button-primary` Verify, `button-secondary-light` Reject,
department assign dropdown, team dispatch dropdown). Calls `GET /api/admin/incidents/{id}` plus
the verify/reject/assign/dispatch/status endpoints on button actions.

**Teams**: read-only `asset-row`-styled list from `GET /api/admin/teams` — name, department,
status badge, last known location.

**Users** (admin-only): `text-input` form (email, name, role dropdown, department dropdown) +
table of existing accounts. Calls `POST /api/admin/users` (this endpoint is a planned backend
addition, not yet built — wire the frontend call now, backend catches up separately) and
`GET /api/admin/users`.

**Alerts**: broadcast form (`text-input` title/message, area, severity select) using
`button-primary` to submit, calling `POST /api/admin/alerts`. List of active alerts below, from
`GET /api/alerts`.

**Predictions**: `asset-row`-styled list from `GET /api/admin/predictions` — ward, risk type, risk
score as a mono percentage, forecast time.

**Analytics**: a grid of `number-display` stat cards from `GET /api/admin/analytics/summary` — no
charting library needed for this version, plain stat cards are sufficient.

## 5. Field-team view — deliberately different shell

Field-team accounts should NOT see the sidebar dashboard shell — give them a simpler, mobile-first
single-column view (`/governmentdashboard/field`) since field workers are likely checking this on
a phone browser mid-task, not at a desk:
- List of assigned tickets (`GET /api/field/assignments`), each an `asset-row`-styled card with
  priority badge
- Tapping one opens ticket detail (`GET /api/field/assignments/{ticket_id}`) with a status-update
  action (`PATCH /api/field/assignments/{ticket_id}/status`)

## 6. Backend integration — exact contract, already built

Base URL from `VITE_API_URL` env var. Auth: JWT in `Authorization: Bearer <token>` header, stored
in memory + `localStorage` on login, attached via an Axios interceptor. On any 401 response,
clear the token and redirect to `/governmentdashboard`.

Every endpoint referenced in §3/§4 above already exists on the backend (per its own spec) except
`POST /api/admin/users` and `GET /api/admin/users`, which are a known, planned addition — build
the frontend call sites for them anyway so nothing needs rework once the backend catches up.

## 7. Technical requirements

- React + Vite, Tailwind CSS v4 via `@tailwindcss/vite` plugin (not the old config-file approach)
- React Router for the two zones (`/` public, `/governmentdashboard/*` gated)
- Axios for API calls, one shared client instance with the JWT interceptor
- Leaflet + `react-leaflet` for the map (OSM tiles, no Google Maps — matches backend's OSM-based
  geo stack)
- No component library (MUI, shadcn, etc.) — build components directly with Tailwind to match the
  reference design system's exact tokens, since a component library's defaults would fight the
  custom pill/radius/shadow system specified in §1
- Mobile-responsive per the reference doc's breakpoint table (§ Responsive Behavior in
  `DESIGN-coinbase.md`) — this matters doubly here since the field-team view is expected to be
  used on phones

## 8. Non-goals

- Do not build the citizen Android app — that's a separate project (Google AI Studio, native
  Kotlin), this is web-only
- Do not build `POST /api/admin/users` on the backend — frontend call sites only, per §6
- Do not add a payments/pricing page, and do not use `pricing-tier-card` anywhere — not applicable
  to this product
- Do not deviate from the design tokens in `DESIGN-coinbase.md` — no inline hex colors, no
  invented spacing values, no component library defaults overriding the pill/radius system
