import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import RootLayout from '../layouts/RootLayout'
import OnboardingLayout from '../layouts/OnboardingLayout'
import LandingPage from '../pages/LandingPage'
import {
  OrganizationPage,
  DepartmentsPage,
  JobTitles,
  EmployeeImportPage,
  InviteTeamPage,
  HrConfigPage,
  CompletePage,
} from '../pages/onboarding'
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

        {/* Onboarding flow */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/onboarding/organization" replace />} />
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="job-titles" element={<JobTitles />} />
          <Route path="import" element={<EmployeeImportPage />} />
          <Route path="invite" element={<InviteTeamPage />} />
          <Route path="hr-config" element={<HrConfigPage />} />
          <Route path="complete" element={<CompletePage />} />
        </Route>

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
