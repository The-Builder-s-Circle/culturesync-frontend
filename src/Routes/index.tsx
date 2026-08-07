import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import LandingPage from '../pages/LandingPage'
import { RegisterPage, VerifyOtpPage, SignInPage } from '../pages/auth'
import ProtectedRoute from './ProtectedRoute'

const DashboardPage = lazy(() => import('../pages/DashboardPage'))

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans text-sm text-slate-500">
      Loading...
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
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
              <ProtectedRoute allowedRole="all">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
