import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 💡 1. මේක Import කළා
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* 💡 2. App එක ඇතුලට දැම්මා */}
      <App />
    </BrowserRouter>
  </StrictMode>
)
