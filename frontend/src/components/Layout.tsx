import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Navbar } from './Navbar'
import './Layout.css'

export function Layout() {
  return (
    <>
      <Header />
      <Navbar />
      <div className="container">
        <Outlet />
      </div>
    </>
  )
}
