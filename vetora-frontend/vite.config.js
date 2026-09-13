import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Without this, Vite only listens on localhost (127.0.0.1), so devices
    // on the same WiFi network — a phone, another computer — get
    // "This site can't be reached" even though the dev server is running.
    // `host: true` binds to all network interfaces (0.0.0.0) so the app is
    // reachable at http://<your-computer's-LAN-IP>:5173 from other devices.
    host: true,
    port: 5173,
  },
})
