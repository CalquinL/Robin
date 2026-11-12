import { Link } from 'react-router-dom'
import robinLogo from '../assets/robin-logo.png'
import './Header.css'

export function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="logo-link">
        <img src={robinLogo} alt="Logo Robin" className="logo-image" />
      </Link>
    </header>
  )
}
