import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import RootLayout from '../layouts/RootLayout'
import LandingPage from '../pages/LandingPage'
import ProtectedRoute from './ProtectedRoute'

const LoginPage = lazy(() => import('../pages/LoginPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-slate-500">
      Loading...
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
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
    </Suspense>
  );
}
