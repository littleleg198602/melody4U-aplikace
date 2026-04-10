# Melody4U Mobile Architecture Analysis

## CURRENT STATE
- Repository is a **single Vite React web app** (`src/`, `public/`) with no monorepo/workspace manager and no existing mobile client folder.  
- Routing is handled by `react-router-dom` in `src/App.jsx`, with main web routes for homepage, create flow (`/create`), share playback (`/p/:id`), legal pages, and analytics dashboards.  
- Create flow already exists in web under `src/pages/create/*` as a 3-step wizard:
  - voice capture/upload
  - music selection from Melody4U library
  - render + share generation
- Existing backend is external (`https://melody4u-api.onrender.com`) with `VITE_API_BASE` overrides.
- Existing web API contracts already cover mobile MVP needs:
  - `POST /api/upload`
  - `GET /api/library`
  - `POST /api/render`
  - `POST /api/share`
  - `GET /api/p/:id`
  - `POST /api/p/:id/consume`
- Pricing truth in web currently marks paid tiers as **coming soon / preparing**, while free tier is active.

## RISKS
- No shared package layer exists today, so mobile must avoid creating conflicting business logic.
- Some web files include historical copies (`*-kopie*`), so touching core web files for mobile bootstrap can increase risk.
- Payment flows are not active in current public UX; mobile must not expose fake purchasable premium plans.
- Backend is external to this repo, so client integration must follow existing endpoints without assuming server-side changes.

## RECOMMENDED MOBILE APPROACH
- Use **React Native + Expo + TypeScript** in a dedicated `mobile/` app.
- Keep backend as single source of truth; mobile only orchestrates upload/render/share/consume.
- Use `expo-router` to keep route-driven screen navigation aligned with current web route mental model.
- Build reusable service layer (`mobile/src/services`) mirroring existing web contracts.

## FILES/FOLDERS TO ADD
- `mobile/` app with Expo Router entrypoint and TypeScript.
- `mobile/src/services` for API integration and base URL config.
- `mobile/src/screens` for Home/Create/Pricing/Share screens.
- `mobile/src/components` and `mobile/src/theme` for reusable UI primitives.

## FILES/FOLDERS TO REUSE
- Backend endpoint contracts from web create/share pages.
- Product behavior and constraints from:
  - `src/pages/create/CreatePage.jsx`
  - `src/pages/create/steps/StepMusic.jsx`
  - `src/pages/SharePage.jsx`
  - `src/pages/Homepage.jsx` (pricing state)

## FILES/FOLDERS TO AVOID TOUCHING
- Existing web rendering, analytics, and production page logic in `src/` unless a mobile integration blocker is found.
- Existing legal and analytics dashboards.
- Existing server-side/payment assumptions (keep secure logic backend-only).
