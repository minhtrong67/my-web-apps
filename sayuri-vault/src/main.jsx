import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { apply } from './appearance'
import './index.css'

apply()
createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>)
