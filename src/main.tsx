import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './App'
import './css/index.css'
import './css/global.css'

export const createRoot = ViteReactSSG(
  { routes },
  ({ isClient }) => {
    
  }
)