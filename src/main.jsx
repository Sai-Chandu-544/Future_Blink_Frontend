import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {AIFlowBuilder} from "./file.jsx"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
<AIFlowBuilder/>
  </StrictMode>,
)
