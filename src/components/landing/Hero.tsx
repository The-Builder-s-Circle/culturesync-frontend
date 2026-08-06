import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import {
  IconArrowRight,
  IconCalendarClock,
  IconChartBar,
  IconClipboardCheck,
  IconSettings,
  IconSparkles,
  IconStar,
  IconTargetArrow,
  IconUsers,
} from '@tabler/icons-react'
import { Button, StatusBadge } from '../ui'
import { Avatar, Container } from './primitives'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

const heroFade = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: EASE, delay },
})

const KPIS = [
  { label: 'Employees', value: '248', delta: '+6.2%', deltaTone: 'text-emerald-600' },
  { label: 'On leave', value: '12', delta: 'today', deltaTone: 'text-slate-400' },
  { label: 'Appraisals', value: '8', delta: 'pending', deltaTone: 'text-amber-600' },
  { label: 'Onboarding', value: '3', delta: 'active', deltaTone: 'text-blue-600' },
]

const EMPLOYEES = [
  { name: 'Amara Okafor', role: 'Product Design', status: 'active' as const },
  { name: 'Tunde Bakare', role: 'Engineering', status: 'onboarding' as const },
  { name: 'Chioma Eze', role: 'Marketing', status: 'on-leave' as const },
  { name: 'Dapo Adeyemi', role: 'Finance', status: 'active' as const },
]

const ONBOARDING_STEPS = [
  { label: 'Company profile', done: true },
  { label: 'Departments', done: true },
  { label: 'Invite your team', done: false },
]

const DEPARTMENTS = [
  { name: 'Engineering', pct: 86 },
  { name: 'Design', pct: 74 },
  { name: 'Sales', pct: 61 },
]

function MiniSidebar() {
  const items = [IconUsers, IconTargetArrow, IconCalendarClock, IconClipboardCheck, IconChartBar, IconSettings]
  return (
    <div className="hidden w-12 flex-col items-center gap-1.5 border-r border-slate-100 bg-slate-50/80 py-3 sm:flex">
      {items.map((Icon, i) => (
        <span
          key={i}
          className={
            'flex size-8 items-center justify-center rounded-lg ' +
            (i === 0 ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400')
          }
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      ))}
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-tr from-indigo-200 via-violet-100 to-transparent blur-2xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 34, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-indigo-900/10 ring-1 ring-slate-900/5"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex h-6 flex-1 items-center justify-center rounded-md bg-slate-100">
            <span className="font-mono text-[11px] text-slate-500">
              app.culturesync.io/acme-corp
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        <div className="flex">
          <MiniSidebar />
          <div className="flex-1 space-y-3.5 p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Good morning, Aisha
                </p>
                <p className="text-[11px] text-slate-500">Tuesday, May 12</p>
              </div>
              <span className="hidden rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 sm:inline-flex">
                + Invite
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {KPIS.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5"
                >
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {kpi.label}
                  </p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <p className="font-display text-lg font-bold text-slate-900">
                      {kpi.value}
                    </p>
                    <p className={`text-[10px] font-medium ${kpi.deltaTone}`}>
                      {kpi.delta}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-5">
              <div className="overflow-hidden rounded-xl border border-slate-100 sm:col-span-3">
                <p className="border-b border-slate-100 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700">
                  Employees
                </p>
                <ul className="divide-y divide-slate-100 bg-white">
                  {EMPLOYEES.map((e) => (
                    <li
                      key={e.name}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar name={e.name} size="sm" />
                        <div>
                          <p className="text-[12px] font-medium text-slate-800">
                            {e.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{e.role}</p>
                        </div>
                      </div>
                      <StatusBadge variant={e.status} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 sm:col-span-2">
                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-[11px] font-semibold text-slate-700">
                    Onboarding
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {ONBOARDING_STEPS.map((s) => (
                      <li key={s.label} className="flex items-center gap-2">
                        <span
                          className={
                            'flex size-4 items-center justify-center rounded-full ' +
                            (s.done
                              ? 'bg-emerald-500 text-white'
                              : 'border border-slate-300 bg-white')
                          }
                        >
                          {s.done ? (
                            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                              <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : null}
                        </span>
                        <span
                          className={
                            'text-[11px] ' +
                            (s.done
                              ? 'text-slate-600 line-through'
                              : 'font-medium text-slate-800')
                          }
                        >
                          {s.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-[11px] font-semibold text-slate-700">
                    Departments
                  </p>
                  <ul className="mt-2 space-y-2">
                    {DEPARTMENTS.map((d) => (
                      <li key={d.name}>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-600">{d.name}</span>
                          <span className="font-mono text-slate-400">
                            {d.pct}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.7 }}
        className="absolute -bottom-5 -left-3 flex animate-float items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg shadow-slate-900/10 sm:-left-8"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-sm">
          🎉
        </span>
        <div>
          <p className="text-[11px] font-semibold text-slate-800">
            Amara completed onboarding
          </p>
          <p className="text-[10px] text-slate-400">2 minutes ago</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.85 }}
        className="absolute -top-5 -right-2 hidden animate-float-delayed items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg shadow-slate-900/10 sm:-right-5 sm:flex"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <IconUsers className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-slate-800">
            +2 employees this week
          </p>
          <p className="text-[10px] text-slate-400">4 workspaces active</p>
        </div>
      </motion.div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36 lg:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-100 via-violet-100 to-transparent blur-3xl"
      />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div>
            <motion.a
              href="#features"
              {...heroFade(0)}
              className="group inline-flex w-fit items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">
                <IconSparkles className="size-3" aria-hidden="true" />
                New
              </span>
              <span className="text-sm font-medium text-slate-600">
                Multi-tenant onboarding wizard
              </span>
              <IconArrowRight
                className="size-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </motion.a>

            <motion.h1
              {...heroFade(0.1)}
              className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]"
            >
              Your people. One workspace.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                From day one.
              </span>
            </motion.h1>

            <motion.p
              {...heroFade(0.2)}
              className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg"
            >
              CultureSync brings employees, goals, appraisals, leave, and
              performance into one platform — with guided onboarding for every
              new organization.
            </motion.p>

            <motion.div
              {...heroFade(0.3)}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to="/login">
                <Button size="lg" className="px-6 shadow-lg shadow-indigo-600/20">
                  Start free
                  <IconArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="secondary" size="lg" className="px-6">
                  Book a demo
                </Button>
              </a>
            </motion.div>

            <motion.div
              {...heroFade(0.4)}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <div className="flex -space-x-2.5">
                {['Ada Obi', 'Sam Idris', 'Lena Park', 'Kofi Mensah'].map((n) => (
                  <Avatar key={n} name={n} size="md" className="ring-white" />
                ))}
                <span className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white ring-2 ring-white">
                  +3.4k
                </span>
              </div>
              <div>
                <div
                  className="flex items-center gap-0.5 text-amber-500"
                  aria-label="Rated 4.9 out of 5"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} className="size-4 fill-current" aria-hidden="true" />
                  ))}
                  <span className="ml-1.5 text-sm font-semibold text-slate-800">
                    4.9/5
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Trusted by 3,400+ HR teams
                </p>
              </div>
            </motion.div>
          </div>

          <DashboardPreview />
        </div>
      </Container>
    </section>
  )
}
