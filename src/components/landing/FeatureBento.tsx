import { motion } from 'motion/react'
import {
  IconCalendarClock,
  IconChartBar,
  IconClipboardCheck,
  IconShieldLock,
  IconTargetArrow,
  IconUserCheck,
} from '@tabler/icons-react'
import type { ComponentType, ReactNode } from 'react'
import { Container, SectionHeading } from './primitives'
import { cn } from '../../lib/cn'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

const GOALS = [
  { label: 'Q3 revenue target', pct: 78, tone: 'from-indigo-500 to-violet-500' },
  { label: 'Ship v2 onboarding', pct: 92, tone: 'from-emerald-500 to-teal-500' },
  { label: 'Hiring plan Q3', pct: 54, tone: 'from-amber-500 to-orange-500' },
]

const REVIEW_CHIPS = ['360° feedback', 'Peer reviews', 'Self-assessment', 'Manager notes']

const LEAVE_BALANCES = [
  { label: 'Annual', used: 6, total: 20 },
  { label: 'Sick', used: 2, total: 10 },
  { label: 'Personal', used: 1, total: 5 },
]

const ONBOARDING_ITEMS = [
  { label: 'Bulk CSV import', done: true },
  { label: 'Contract & document upload', done: true },
  { label: 'IT account provisioning', done: false },
  { label: 'Welcome email automation', done: false },
]

const BARS = [42, 58, 51, 74, 66, 88, 79]

const ROLES = ['Owner', 'Admin', 'Manager', 'Employee']

type Feature = {
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: any }>
  title: string
  description: string
  span: string
  dark?: boolean
  visual: ReactNode
}

const FEATURES: Feature[] = [
  {
    Icon: IconTargetArrow,
    title: 'Goals & OKRs',
    description:
      'Align every team around company objectives with live progress tracking and automated check-ins.',
    span: 'lg:col-span-2',
    visual: (
      <ul className="space-y-3">
        {GOALS.map((g) => (
          <li key={g.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{g.label}</span>
              <span className="font-mono text-slate-500">{g.pct}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r', g.tone)}
                style={{ width: `${g.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    ),
  },
  {
    Icon: IconClipboardCheck,
    title: 'Performance reviews',
    description:
      'Structured appraisals with 360° feedback, ratings, and action plans — ready for every review cycle.',
    span: 'lg:col-span-1',
    visual: (
      <div className="flex flex-wrap gap-1.5">
        {REVIEW_CHIPS.map((c) => (
          <span
            key={c}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
          >
            {c}
          </span>
        ))}
      </div>
    ),
  },
  {
    Icon: IconCalendarClock,
    title: 'Leave management',
    description:
      'Balances, approvals, and team calendars in one view. Policy rules applied automatically per organization.',
    span: 'lg:col-span-1',
    visual: (
      <ul className="space-y-2.5">
        {LEAVE_BALANCES.map((l) => (
          <li key={l.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{l.label}</span>
              <span className="font-mono text-slate-500">
                {l.used}/{l.total} days
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${(l.used / l.total) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    ),
  },
  {
    Icon: IconUserCheck,
    title: 'Onboarding & offboarding',
    description:
      'Turn paperwork into a checklist. Auto-provision accounts, collect documents, and send welcome emails on day one.',
    span: 'lg:col-span-2',
    visual: (
      <ul className="grid gap-2 sm:grid-cols-2">
        {ONBOARDING_ITEMS.map((item) => (
          <li
            key={item.label}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium',
              item.done
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-slate-50 text-slate-500'
            )}
          >
            <span
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-full',
                item.done ? 'bg-emerald-500 text-white' : 'border border-slate-300'
              )}
            >
              {item.done ? (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    ),
  },
  {
    Icon: IconChartBar,
    title: 'People analytics',
    description:
      'Headcount, turnover, and engagement — live dashboards per workspace that your leadership actually reads.',
    span: 'lg:col-span-2',
    dark: true,
    visual: (
      <div className="flex h-24 items-end gap-2">
        {BARS.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
            className={cn(
              'flex-1 rounded-t-md',
              i === BARS.length - 2
                ? 'bg-gradient-to-t from-indigo-500 to-violet-400'
                : 'bg-white/15'
            )}
          />
        ))}
      </div>
    ),
  },
  {
    Icon: IconShieldLock,
    title: 'Access & roles',
    description:
      'Granular roles per workspace, SSO-ready, with audit logs for every action across every tenant.',
    span: 'lg:col-span-1',
    visual: (
      <div className="flex flex-wrap gap-1.5">
        {ROLES.map((r) => (
          <span
            key={r}
            className={cn(
              'rounded-lg border px-2.5 py-1 text-[11px] font-semibold',
              r === 'Owner'
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            )}
          >
            {r}
          </span>
        ))}
      </div>
    ),
  },
]

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const { Icon, title, description, span, dark, visual } = feature
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.55, ease: EASE, delay: (index % 3) * 0.08 }}
      className={cn(
        'group flex flex-col rounded-2xl border p-6 sm:p-7',
        span,
        dark
          ? 'border-slate-800 bg-slate-900 text-white shadow-xl shadow-slate-900/10'
          : 'border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-xl',
            dark ? 'bg-white/10 text-violet-300' : 'bg-indigo-50 text-indigo-600'
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={cn(
            'mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
            dark ? 'text-white/40' : 'text-slate-300'
          )}
        >
          <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3
        className={cn(
          'mt-5 font-display text-lg font-bold',
          dark ? 'text-white' : 'text-slate-900'
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'mt-2 text-sm leading-relaxed',
          dark ? 'text-slate-400' : 'text-slate-600'
        )}
      >
        {description}
      </p>
      <div className="mt-6 flex-1">{visual}</div>
    </motion.article>
  )
}

export default function FeatureBento() {
  return (
    <section id="features" className="scroll-mt-24 bg-canvas py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything HR, in one place."
          description="Six modules that work together — so people data flows from hiring to appraisal without a spreadsheet in sight."
        />
        <div className="mt-14 grid gap-4 sm:gap-5 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </Container>
    </section>
  )
}
