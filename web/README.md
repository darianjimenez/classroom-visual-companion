# Classroom Visual Companion

Turns what a teacher says into a live picture storyboard for the class.

- `src/engine/` – the picture engine and lesson library (plain JavaScript, shared with the picture tests)
- `src/app/store.js` – app behaviour: playback, Just talk, live voice, settings
- `src/components/app/` – the screens, built from shadcn/ui components on Base UI
- `public/` – icons, the OpenMoji picture bundle and the credits page

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Pushing to `main` builds and publishes the site through GitHub Actions (`.github/workflows/deploy.yml`).
