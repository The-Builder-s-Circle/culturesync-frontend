import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/ui'
import { IconCheck, IconRocket } from '@tabler/icons-react'
import { useOnboarding, useAuth } from '../../store'
import { tenantApi } from '../../api'
import type { OnboardingData } from '../../api'

const DAY_NAMES: Record<number, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
}

function formatWorkWeek(days?: (number | string)[] | null): string {
  if (!days || days.length === 0) return 'Not configured'
  const names = days
    .map((d) => {
      const num = typeof d === 'string' ? Number(d) : d
      if (Number.isFinite(num)) return DAY_NAMES[num]
      return String(d)
    })
    .filter(Boolean)
  return [...new Set(names)].join(' — ')
}

function formatPayPeriod(value?: string | null): string {
  if (!value) return 'Not configured'
  const formatted = value.replace(/[_-]/g, '-').replace(/\b\w/g, (c) => c.toUpperCase())
  return formatted
}

function buildSummary(data: OnboardingData | null): { label: string; value: string }[] {
  if (!data) return []
  return [
    { label: 'Organization', value: data.organizationName || '—' },
    { label: 'Departments', value: `${data.noOfDepartments ?? 0} configured` },
    { label: 'Job titles', value: `${data.noOfJobTitles ?? 0} defined` },
    { label: 'Team invites', value: `${data.noOfEmployeesInvited ?? 0} pending` },
    { label: 'Work week', value: formatWorkWeek(data.workingDays) },
    { label: 'Pay period', value: formatPayPeriod(data.payPeriod) },
  ]
}

export default function CompletePage() {
  const { user } = useAuth()
  const { tenantId, setTenantId } = useOnboarding()

  const [summary, setSummary] = useState<{ label: string; value: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        let activeTenantId = tenantId || user?.tenantId || null
        if (!activeTenantId) {
          activeTenantId = await tenantApi.resolveActiveTenantId()
          if (activeTenantId) {
            setTenantId(activeTenantId)
          }
        }
        if (!activeTenantId) return

        const res = await tenantApi.getOnboardingData(activeTenantId)
        if (!cancelled) {
          setSummary(buildSummary(res.data ?? null))
        }
      } catch {
        if (!cancelled) setSummary([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [tenantId, user?.tenantId, setTenantId])

  return (
    <div className="flex flex-col items-center py-8 text-center">
      {/* Success animation */}
      <div className="pulse-ring relative flex size-24 items-center justify-center rounded-full bg-emerald-50">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <IconCheck className="size-7" aria-hidden="true" />
        </span>
        <span
          className="confetti-piece size-1.5 rounded-sm bg-indigo-500"
          style={{ left: '-6px', top: '28px', animationDelay: '0.2s' }}
        />
        <span
          className="confetti-piece size-2 rounded-full bg-amber-400"
          style={{ right: '-10px', top: '16px', animationDelay: '0.5s' }}
        />
        <span
          className="confetti-piece size-1.5 rotate-45 bg-rose-400"
          style={{ left: '10px', bottom: '-8px', animationDelay: '0.35s' }}
        />
        <span
          className="confetti-piece size-1.5 rounded-sm bg-sky-400"
          style={{ right: '2px', bottom: '-10px', animationDelay: '0.7s' }}
        />
      </div>

      <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        You're all set!
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
        Welcome to CultureSync. Your workspace is ready — jump into the dashboard
        or review your configuration first.
      </p>

      <div className="mt-8 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white text-left">
        <div className="border-b border-slate-100 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Configuration summary
          </p>
        </div>
        <dl className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="space-y-3 px-5 py-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : summary.length > 0 ? (
            summary.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-5 py-3">
                <dt className="text-sm text-slate-500">{item.label}</dt>
                <dd className="text-sm font-semibold text-slate-800">{item.value}</dd>
              </div>
            ))
          ) : (
            <div className="px-5 py-6 text-sm text-slate-500">
              Your configuration couldn't be loaded. You can review it later from Settings.
            </div>
          )}
        </dl>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link to="/dashboard">
          <Button size="lg">
            <IconRocket className="size-4" aria-hidden="true" />
            Go to dashboard
          </Button>
        </Link>
        <Link
          to="/onboarding/invite"
          className="text-sm font-medium text-slate-400 transition-colors hover:text-indigo-600"
        >
          Back to invites
        </Link>
      </div>
    </div>
  )
}
