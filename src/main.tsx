import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import"bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"

import "@fontsource/poppins/latin-400.css"
import "@fontsource/poppins/latin-500.css"
import "@fontsource/poppins/latin-600.css"
import "@fontsource/poppins/latin-700.css"



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    
  </StrictMode>,
)
