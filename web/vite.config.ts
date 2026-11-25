import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  // relative paths, so the same build works on GitHub Pages (a sub-folder) or anywhere else
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      filename: "sw.js",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2,json}"],
        // about 1,500 symbol pictures and the diagram files: each is cached the first time a lesson shows it, not all at install
        // (the small table of which word shows which symbol, symbols/index.json, is cached at install)
        globIgnores: ["symbols/*.svg", "diagrams/**"],
        runtimeCaching: [{ urlPattern: /\/(symbols|diagrams)\/[^/]+\.svg$/, handler: "CacheFirst", options: { cacheName: "pictures", expiration: { maxEntries: 3000 } } }],
        // the OpenMoji picture bundle is about 5 MB
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
        // the plugin only adds these itself when it injects the register script; without them a new version waits until every tab is closed
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: "Plato",
        short_name: "Plato",
        description: "Turns what a teacher says into a live picture storyboard for the class.",
        start_url: "./",
        scope: "./",
        display: "standalone",
        background_color: "#FDFBF7",
        theme_color: "#FDFBF7",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  // the picture engine (hundreds of hand-drawn pictures and 64 diagrams) is about 300 KB on its own
  build: { chunkSizeWarningLimit: 1100 },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
})
