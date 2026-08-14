import { Outlet, NavLink, useLocation } from 'react-router'
import { Logo } from '../components/ui'
import { StepDot } from '../components/ui'
import { ONBOARDING_STEPS, findStepIndex } from '../pages/onboarding/steps'
import { useOnboarding, useAuth } from '../store'

export default function OnboardingLayout() {
  const { pathname } = useLocation()
  const activeIndex = findStepIndex(pathname)
  const activeStep = ONBOARDING_STEPS[activeIndex]
  const { completedSteps, percentComplete } = useOnboarding()
  const { user } = useAuth()

  const companyDisplayName = user?.companyName || 'Your Organization'
  const companyInitial = companyDisplayName.charAt(0).toUpperCase() || 'C'

  return (
    <div className="min-h-screen bg-canvas font-sans md:flex">
      {/* ---------- Left rail: setup steps ---------- */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 p-6">
          <Logo />
          <p className="mt-1 text-xs font-medium text-slate-500">Organization Setup</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Setup Steps
          </p>
          <nav className="space-y-1">
            {ONBOARDING_STEPS.map((step, i) => {
              const isDone = completedSteps.includes(step.id)
              const isActive = i === activeIndex
              const status = isDone ? 'complete' : isActive ? 'active' : 'pending'

              return (
                <NavLink
                  key={step.id}
                  to={step.path}
                  className={({ isActive: isLinkActive }) =>
                    `nav-item ${isLinkActive ? 'active' : ''}`.trim()
                  }
                >
                  <StepDot step={step.number} status={status} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{step.title}</span>
                    <span className="block truncate text-xs text-slate-400">
                      {step.subtitle}
                    </span>
                  </span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-display text-sm font-bold text-indigo-600">
              {companyInitial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {companyDisplayName}
              </p>
              <p className="text-xs text-slate-400">Configuring…</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- Main column ---------- */}
      <main className="flex min-h-screen flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:hidden">
          <Logo className="[&>div]:!size-8" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Step {activeStep.number} of {ONBOARDING_STEPS.length}
          </span>
        </header>

        {/* Step header */}
        <section className="border-b border-slate-200 bg-white px-6 py-5 sm:px-10">
          <div className="mx-auto flex max-w-3xl items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-indigo-600">
                Step {activeStep.number} of {ONBOARDING_STEPS.length}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-slate-900">
                {activeStep.title}
              </h2>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-xs font-medium text-slate-500">
                {percentComplete}% complete
              </span>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Page content */}
        <section className="flex-1 px-6 py-8 sm:px-10 sm:py-10">
          <div className="mx-auto w-full max-w-3xl animate-fade-up">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  )
}
