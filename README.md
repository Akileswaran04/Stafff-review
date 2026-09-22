# DIST staff review portal

Next.js + Tailwind + Framer Motion + GSAP. No database: staff and reviews live in a
git-committed, hashed data file, checked with a signed cookie — see **Auth model** below.

    npm install
    npm run dev

Sign in with a staff login code (see **Getting login codes**, below — codes are not in this repo).

## Auth model

- **Login codes are never stored in plaintext**, anywhere in the repo. `src/lib/staff-directory.data.ts`
  (committed) holds each staff member's name/department and a per-record `salt` + `hash`: the code,
  HMAC'd with a secret pepper (`PORTAL_LOGIN_PEPPER`, in `.env.local`, never committed), then run
  through `scrypt`. Reading the file — or the whole repo on GitHub — gives you no working code: you'd
  need the pepper too, and it isn't there.
- **Login**: `POST /api/auth/login` hashes the submitted code the same way and compares it (in
  constant time) against every record. A match issues a cookie: `${staffId}:${expiresAtMs}.${hmac}`,
  signed with a second secret (`SESSION_SECRET`). `staffId` itself (e.g. `DIST-VMWQ`) isn't secret —
  it's just a lookup key — but the signature means nobody can hand-craft a cookie for someone else's
  id and get in without knowing that secret too.
- **Dashboard**: a server component verifies the cookie's signature and expiry, looks up the staff
  record and that staff member's reviews, and renders them. `src/lib/staff-directory.ts` is guarded
  with the `server-only` package, so importing it from a Client Component fails the build instead of
  quietly shipping names/reviews to the browser.
- The login throttle (`src/app/api/auth/login/route.ts`) is per-process and best-effort; a real
  deployment behind more than one instance should put a real rate limiter in front of it too.

## Getting login codes

Codes are generated locally and handed out directly — they're never in git.

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # run twice
```

Put the two results in `.env.local` (copy `.env.example` first) as `PORTAL_LOGIN_PEPPER` and
`SESSION_SECRET`. Then:

```
node --env-file=.env.local scripts/generate-staff-directory.mjs
```

This (re)writes `src/lib/staff-directory.data.ts` (commit this) and `staff-login-codes.local.txt`
(gitignored — the plaintext handout; distribute it privately, e.g. one code per teacher over a
channel they already trust, then delete it or keep it somewhere private, not in the repo).

To add, remove or edit staff or reviews, edit the `STAFF_INPUT` array at the top of
`scripts/generate-staff-directory.mjs` and rerun it — it needs the **same** `PORTAL_LOGIN_PEPPER` as
before, or every existing code stops matching its hash and everyone needs a new one.

## Layout

| Path | What |
| --- | --- |
| `scripts/generate-staff-directory.mjs` | Source of truth for staff + reviews; produces the hashed data file and the code handout |
| `src/lib/staff-directory.data.ts` | Generated — names, depts, salts, hashes, reviews. Safe to commit (no plaintext codes) |
| `src/lib/staff-directory.ts` | Verifies a login code, looks up a staff record / their reviews |
| `src/lib/session.ts` | Signs and verifies the session cookie |
| `tailwind.config.ts`, `src/app/globals.css` | "Midnight Editorial" tokens — ink-navy ground, ivory type, one brass accent, flat colours only |
| `Landing.tsx`, `LoginForm.tsx`, `NetworkField.tsx` | Page 1 — the DIST network-mesh intro and login |
| `DashboardShell.tsx`, `ProfileHeader.tsx` | Page 2 header |
| `ReviewGrid.tsx`, `ReviewCard.tsx`, `ReviewModal.tsx` | The review tiles (privacy-blur toggle, hover/click to open) and the opened-review panel | 