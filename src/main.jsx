import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bodoni-moda/wght.css'
import '@fontsource-variable/bodoni-moda/wght-italic.css'
import '@fontsource-variable/schibsted-grotesk'
import '@fontsource/fragment-mono/400.css'
import './styles/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
