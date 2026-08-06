import { Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import LandingPage from '../pages/LandingPage'
import DashboardPage from '../pages/DashboardPage'
import { RegisterPage, VerifyOtpPage, SignInPage } from '../pages/auth'
import ProtectedRoute from './ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/auth/login" element={<SignInPage />} />
      <Route path="/login" element={<SignInPage />} />
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
