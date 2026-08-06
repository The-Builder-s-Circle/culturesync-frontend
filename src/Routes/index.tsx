import { Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import ProtectedRoute from './ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RootLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole={"all"}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
