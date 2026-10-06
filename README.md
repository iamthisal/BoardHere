# BoardHere

A first working slice of a Colombo boarding-point guide. Enter a starting point or use GPS, choose a bus drop-off stop, and compare walking or tuk access to an eligible boarding stop.

## Run locally

```sh
npm install
npm run dev
npm test
npm run build
```

The app currently has a sample corridor with selectable drop-off stops, preset starting places, GPS, and map-click origin selection. It recommends an option based on estimated time and cost, with separate fastest and cheapest sorting.

The route, stop coordinates, fares, and times are **illustrative demo data**. The dashed map line is a sample corridor, not a verified bus path. Estimates use fixed walking, tuk, and bus speeds plus an assumed eight-minute wait. There is no live bus data, street-level walking route, tuk booking, or Supabase connection yet. Verify stops and route coverage on the ground before using this for real journeys. GPS needs browser location permission and a secure context (localhost works).

## Branches and commits

- `main`: stable, reviewed releases.
- `develop`: integration branch for completed features.
- `feat/*`, `fix/*`, `chore/*`: focused branches from `develop`.
- Merge a feature into `develop` after review; promote tested `develop` changes to `main`.
- Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) and keep each commit focused.

## Near-term milestones

1. Working boarding-option comparison for a small illustrative corridor.
2. Verify local routes, stop coordinates, and fares; replace demo data.
3. Persist verified routes and stops in Supabase, with safe editing access.
4. Add crowd reports after the core boarding flow is reliable.
