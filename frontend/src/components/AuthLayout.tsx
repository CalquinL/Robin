import type { ReactNode } from 'react'
import robinLogo from '../assets/robin-logo.png'
import './AuthLayout.css'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-card card-box">
        <img src={robinLogo} alt="Logo Robin" className="auth-logo" />
        {children}
      </div>
    </div>
  )
}
