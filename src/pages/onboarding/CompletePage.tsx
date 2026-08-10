import { Link } from 'react-router'
import { Button } from '../../components/ui'
import { IconCheck, IconRocket } from '@tabler/icons-react'

const SUMMARY = [
  { label: 'Organization', value: 'CultureSync Inc.' },
  { label: 'Departments', value: '8 configured' },
  { label: 'Job titles', value: '12 defined' },
  { label: 'Team invites', value: '2 pending' },
  { label: 'Work week', value: 'Monday — Friday' },
  { label: 'Pay period', value: 'Bi-weekly' },
]

export default function CompletePage() {
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
          {SUMMARY.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-5 py-3">
              <dt className="text-sm text-slate-500">{item.label}</dt>
              <dd className="text-sm font-semibold text-slate-800">{item.value}</dd>
            </div>
          ))}
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
