import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconArrowRight, IconChevronDown } from '@tabler/icons-react'
import { Container, Eyebrow, Reveal } from './primitives'
import { cn } from '../../lib/cn'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

const FAQS = [
  {
    q: 'What does multi-tenant mean for us?',
    a: 'Each organization you manage gets its own isolated workspace with its own departments, policies, roles, and data. Nothing leaks across tenants, and each one can be branded and configured independently.',
  },
  {
    q: 'How long does onboarding actually take?',
    a: 'Most organizations go from signup to fully configured in about 11 minutes. The guided wizard walks you through workspace profile, departments, team invites, and HR settings step by step.',
  },
  {
    q: 'Can we migrate from spreadsheets or another HR tool?',
    a: 'Yes. You can bulk-import employees, departments, and leave balances from CSV. Our onboarding automation also collects contracts and documents so nothing gets lost in the move.',
  },
  {
    q: 'Is CultureSync secure and compliant?',
    a: 'Every workspace is isolated, data is encrypted in transit and at rest, and role-based access is enforced at the tenant level. Enterprise plans add SSO/SAML, audit logs, and a 99.9% uptime SLA.',
  },
  {
    q: 'Do we need IT or engineering to set it up?',
    a: 'No. CultureSync is built for HR teams. The only optional technical step is SSO on Enterprise, and our team handles that with you in a single call.',
  },
  {
    q: 'What happens if we outgrow our plan?',
    a: 'Upgrade anytime. You keep all your data and settings. Pricing is per active user per month, and you can start free on Starter with no credit card.',
  },
]

function FaqItem({ faq, open, onToggle }: {
  faq: (typeof FAQS)[number]
  open: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-white transition-colors',
        open ? 'border-indigo-200 shadow-sm' : 'border-slate-200'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-[15px] font-semibold text-slate-900">
          {faq.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full',
            open ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
          )}
        >
          <IconChevronDown className="size-4" aria-hidden="true" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">
              {faq.a}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-24 bg-canvas py-24 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow>FAQ</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Questions, answered.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-600">
                Everything you need to know about the product and the pitch. Can't
                find what you're looking for?
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <a
                href="#pricing"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Compare plans
                <IconArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Reveal>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={Math.min(i * 0.05, 0.2)}>
                <FaqItem
                  faq={faq}
                  open={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
