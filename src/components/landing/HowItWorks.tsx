import { motion } from 'motion/react'
import {
  IconArrowRight,
  IconBuilding,
  IconRocket,
  IconUserPlus,
} from '@tabler/icons-react'
import type { ComponentType } from 'react'
import { Container, SectionHeading } from './primitives'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

const STEPS: Array<{
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: string | boolean }>
  title: string
  description: string
}> = [
  {
    Icon: IconBuilding,
    title: 'Create a workspace',
    description:
      'Sign up with your work email and spin up a branded workspace for your organization in about a minute.',
  },
  {
    Icon: IconUserPlus,
    title: 'Invite your org',
    description:
      'Add departments and people — one by one or in bulk from CSV. Everyone lands on a guided first day.',
  },
  {
    Icon: IconRocket,
    title: 'Go live',
    description:
      'Policies, reviews, and goals are configured and ready. Your team starts today, not next quarter.',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-slate-200/70 bg-white py-24 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Live in under a minute."
          description="Three steps between you and a fully configured HR platform."
        />

        <div className="relative mt-16 grid gap-10 lg:grid-cols-3 lg:gap-8">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-slate-300 lg:block"
          />
          {STEPS.map((step, i) => {
            const { Icon } = step
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, ease: EASE, delay: i * 0.12 }}
                className="relative text-center lg:px-2"
              >
                <div className="relative z-10 mx-auto flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <Icon className="size-5 text-indigo-600" aria-hidden="true" />
                </div>
                <p className="mt-5 font-mono text-xs font-medium tracking-widest text-indigo-600">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 text-center"
        >
          <a
            href="#pricing"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
          >
            See plans and pricing
            <IconArrowRight className="size-4" aria-hidden="true" />
          </a>
        </motion.p>
      </Container>
    </section>
  )
}
