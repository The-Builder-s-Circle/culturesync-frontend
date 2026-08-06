import { motion } from 'motion/react'
import {
  IconBuildingBank,
  IconSettings,
  IconUserPlus,
  IconUsersGroup,
} from '@tabler/icons-react'
import type { ComponentType } from 'react'
import { Container, Eyebrow, Reveal } from './primitives'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

const STEPS: Array<{
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: string | boolean }>
  chip: string
  title: string
  description: string
  meta: string
}> = [
  {
    Icon: IconBuildingBank,
    chip: 'bg-indigo-50 text-indigo-600',
    title: 'Create your workspace',
    description:
      'Every new organization gets an isolated workspace with its own settings, branding, and data — no cross-tenant leaks, ever.',
    meta: '~1 min',
  },
  {
    Icon: IconUsersGroup,
    chip: 'bg-violet-50 text-violet-600',
    title: 'Set up departments',
    description:
      'Map your org chart in minutes with visual department cards — no meetings, no spreadsheets, no IT ticket.',
    meta: '~3 min',
  },
  {
    Icon: IconUserPlus,
    chip: 'bg-emerald-50 text-emerald-600',
    title: 'Invite your team',
    description:
      'Bulk-invite employees by email or CSV. Each person gets a personalized welcome and a guided first day.',
    meta: '~2 min',
  },
  {
    Icon: IconSettings,
    chip: 'bg-amber-50 text-amber-600',
    title: 'Configure HR settings',
    description:
      'Leave policies, review cycles, and goals — tuned to each organization\u2019s culture, not a one-size template.',
    meta: '~5 min',
  },
]

export default function OnboardingJourney() {
  return (
    <section className="bg-white py-24 sm:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow>Multi-tenant onboarding</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                From first employee to fully configured.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
                Every new organization gets a guided workspace setup — profile,
                departments, invites, and HR settings — without a single support
                call.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-canvas p-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-lg">
                  ⚡
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Median time to live: 11 minutes
                  </p>
                  <p className="text-xs text-slate-500">
                    Across 3,400+ workspaces
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <ol className="relative">
            <div
              aria-hidden="true"
              className="absolute left-[23px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent"
            />
            {STEPS.map((step, i) => {
              const { Icon } = step
              return (
                <li key={step.title} className="relative pl-16">
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className={`absolute left-0 top-0 flex size-12 items-center justify-center rounded-2xl ${step.chip}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </motion.span>

                  <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4, margin: '0px 0px -40px 0px' }}
                    transition={{ duration: 0.55, ease: EASE }}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-xs font-medium tracking-widest text-indigo-600">
                        STEP {String(i + 1).padStart(2, '0')}
                      </p>
                      <span className="text-[11px] font-medium text-slate-400">
                        {step.meta}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-xl font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                  </motion.div>
                </li>
              )
            })}
          </ol>
        </div>
      </Container>
    </section>
  )
}
