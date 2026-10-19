import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import TrackPage from './pages/TrackPage'
import OrgDashboard from './pages/OrgDashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/track" replace />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/track/:trackingNumber" element={<TrackPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/org"
            element={
              <ProtectedRoute role="ORG">
                <OrgDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="SUPER_ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/track" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
