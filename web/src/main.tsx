import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { registerSW } from "virtual:pwa-register"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)

// works offline after the first visit
if (/^https?:$/.test(location.protocol)) {
  registerSW({ immediate: true })
  // the previous version of the app kept its own caches; they are not used any more
  caches?.keys().then((keys) => keys.filter((k) => k.startsWith("cvc-")).forEach((k) => caches.delete(k))).catch(() => {})
}
