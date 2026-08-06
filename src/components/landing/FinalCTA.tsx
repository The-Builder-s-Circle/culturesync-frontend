import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { IconArrowRight } from '@tabler/icons-react'
import { Button } from '../ui'
import { Container } from './primitives'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

export default function FinalCTA() {
  return (
    <section className="bg-canvas pb-24 sm:pb-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-16 text-center shadow-2xl shadow-indigo-900/30 sm:px-16 sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-dot-grid opacity-20 [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,black,transparent)]"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-100">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              14-day free trial
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Your people deserve better than spreadsheets.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-indigo-100 sm:text-lg">
              Set up your workspace today — invite your team, and see everything
              your organization needs in one place.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                // className="border  border-white/10 bg-white px-7 text-indigo-700 shadow-lg hover:bg-indigo-50"
                variant="secondary"
                className="hover:scale-105"
              >
                Start free
                <IconArrowRight className="size-4" aria-hidden="true" />
              </Button>

              <a href="#pricing">
                <Button
                  variant="ghost"
                  size="lg"
                  className="px-7 border text-white hover:bg-white/12 hover:text-white"
                >
                  View pricing
                </Button>
              </a>
            </div>
            <p className="mt-5 text-xs text-indigo-200">
              No credit card required · Cancel anytime
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
