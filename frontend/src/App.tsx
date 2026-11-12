import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleRoute } from './components/RoleRoute'
import { AdminReviewPage } from './pages/AdminReviewPage'
import { CreatePublicationPage } from './pages/CreatePublicationPage'
import { FeedPage } from './pages/FeedPage'
import { LoginPage } from './pages/LoginPage'
import { MyDonationsPage } from './pages/MyDonationsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { PublicationDetailPage } from './pages/PublicationDetailPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<FeedPage />} />
          <Route path="/publications/:id" element={<PublicationDetailPage />} />
          <Route element={<RoleRoute allow={['beneficiario']} />}>
            <Route path="/publications/new" element={<CreatePublicationPage />} />
          </Route>
          <Route element={<RoleRoute allow={['donante', 'beneficiario']} />}>
            <Route path="/my-donations" element={<MyDonationsPage />} />
          </Route>
          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/admin/review" element={<AdminReviewPage />} />
          </Route>
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
