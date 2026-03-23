import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { VitalsProvider } from './context/VitalsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VitalsProvider>
      <App />
    </VitalsProvider>
  </StrictMode>,
)
