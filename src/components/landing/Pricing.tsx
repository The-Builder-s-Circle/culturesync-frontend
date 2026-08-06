import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconCheck } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui'
import { Container, Reveal, SectionHeading } from './primitives'
import { cn } from '../../lib/cn'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

type Billing = 'monthly' | 'annual'

const PLANS: Array<{
  name: string
  tagline: string
  monthly: number | null
  annual: number | null
  cta: string
  featured?: boolean
  features: string[]
}> = [
  {
    name: 'Starter',
    tagline: 'For small teams getting started',
    monthly: 0,
    annual: 0,
    cta: 'Start free',
    features: [
      '1 workspace',
      'Up to 25 employees',
      'Goals & OKRs',
      'Leave management',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    tagline: 'For growing companies',
    monthly: 8,
    annual: 6,
    cta: 'Start free trial',
    featured: true,
    features: [
      'Everything in Starter',
      'Performance reviews',
      'People analytics',
      'Onboarding automation',
      'Custom roles & permissions',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'For multi-tenant organizations',
    monthly: null,
    annual: null,
    cta: 'Talk to sales',
    features: [
      'Unlimited workspaces',
      'SSO / SAML',
      'Audit logs',
      'Dedicated CSM',
      '99.9% uptime SLA',
    ],
  },
]

function Price({
  plan,
  billing,
}: {
  plan: (typeof PLANS)[number]
  billing: Billing
}) {
  if (plan.monthly === null) {
    return (
      <p className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
        Custom
      </p>
    )
  }
  const price = billing === 'monthly' ? plan.monthly : plan.annual!
  return (
    <div className="flex items-baseline gap-1.5">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={`${plan.name}-${billing}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="font-display text-5xl font-extrabold tracking-tight text-slate-900"
        >
          ${price}
        </motion.p>
      </AnimatePresence>
      <span className="text-sm font-medium text-slate-500">
        / user / month
      </span>
    </div>
  )
}

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>('annual')

  return (
    <section id="pricing" className="scroll-mt-24 bg-white py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing."
          description="Start free. Scale when your team does. No hidden fees, no per-module upsells."
        />

        <Reveal delay={0.1}>
          <div className="mt-8 flex justify-center">
            <div
              role="group"
              aria-label="Billing period"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-canvas p-1"
            >
              {(['monthly', 'annual'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setBilling(period)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                    billing === period
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {period === 'monthly' ? 'Monthly' : 'Annual'}
                </button>
              ))}
              <span className="mr-1 hidden rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                Save 20%
              </span>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.1 }}
              className={cn(
                'relative flex flex-col rounded-2xl border p-7',
                plan.featured
                  ? 'border-indigo-600 bg-slate-900 text-white shadow-xl shadow-indigo-900/20 lg:-my-3 lg:py-10'
                  : 'border-slate-200 bg-white shadow-sm'
              )}
            >
              {plan.featured ? (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">
                  Most popular
                </span>
              ) : null}

              <h3
                className={cn(
                  'font-display text-lg font-bold',
                  plan.featured ? 'text-white' : 'text-slate-900'
                )}
              >
                {plan.name}
              </h3>
              <p
                className={cn(
                  'mt-1 text-sm',
                  plan.featured ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                {plan.tagline}
              </p>

              <div className="mt-6">
                <Price plan={plan} billing={billing} />
              </div>

              <div className="my-6 h-px bg-slate-800/10" />

              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span
                      className={cn(
                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                        plan.featured
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-indigo-50 text-indigo-600'
                      )}
                    >
                      <IconCheck className="size-3.5" aria-hidden="true" />
                    </span>
                    <span
                      className={cn(
                        plan.featured ? 'text-slate-200' : 'text-slate-600'
                      )}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link to="/login">
                  <Button
                    variant={plan.featured ? 'primary' : 'secondary'}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-sm text-slate-500">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
