# Plato

Turns what a teacher says into a live picture storyboard for the class.

- `src/engine/` – the picture engine and lesson library (plain JavaScript; its word lists are JSON in `words/`)
- `src/app/store/` – app behaviour in typed slices: playback, Just talk, live voice, lessons, settings
- `src/app/whisper/` – speech recognition on the device with Whisper, for browsers without Chrome's speech service
- `src/components/app/` – the screens, built from shadcn/ui components on Base UI
- `public/` – icons, the OpenMoji picture bundle, symbol and diagram pictures, and the credits page
- `tools/pictures/` – rebuilds the picture data from OpenMoji, Mulberry Symbols and Wikimedia Commons

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # engine, store and voice tests (UPDATE_SNAPSHOTS=1 npm run test:update to accept changes)
npm run build    # production build in dist/
```

Pushing to `main` lints, tests, builds and publishes the site through GitHub Actions (`.github/workflows/deploy.yml`).
