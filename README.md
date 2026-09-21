# DIST staff review portal (demo)

Next.js + Tailwind + Framer Motion + GSAP. No backend: staff and reviews are hardcoded in `src/lib/demo-data.ts`.

    npm install
    npm run dev

Sign in with `DIST-1042` (12 reviews, mixed), `DIST-2210` (6 reviews, lower average) or `DIST-0387` (empty state).
The demo ID chips on the landing page fill the input for you.

The session is an httpOnly cookie holding the staff ID (`src/lib/session.ts`); `/dashboard` redirects to `/` without it.
To go real later, replace `findStaff` / `reviewsFor` and the cookie check with your data source.
# Stafff-review
