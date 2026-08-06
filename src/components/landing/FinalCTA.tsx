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
          className="relative rounded-[2rem] bg-indigo-700 px-6 py-16 text-center shadow-xl shadow-indigo-900/20 sm:px-16 sm:py-20"
        >
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Onboard your team in days, not weeks.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-indigo-100 sm:text-lg">
              Invite your people, configure HR settings, and start onboarding
              today. No spreadsheets required.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/login">
                <Button
                  variant="inverse"
                  size="lg"
                  className="px-7 shadow-lg hover:scale-102 "
                >
                  Start free
                  <IconArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button
                  variant="ghost"
                  size="lg"
                  className="px-7 text-white hover:bg-white/10 hover:text-white"
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
  )
}
