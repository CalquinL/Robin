import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider'
import { SavedPublicationsProvider } from './context/SavedPublicationsProvider'
import './styles/global.css'
import './styles/shared.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SavedPublicationsProvider>
          <App />
        </SavedPublicationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
