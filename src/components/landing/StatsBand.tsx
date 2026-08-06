import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Container, Reveal } from './primitives'

function CountUp({
  value,
  suffix = '',
  decimals = 0,
}: {
  value: number
  suffix?: string
  decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView || !ref.current) return
    if (reduce) {
      setDisplay(value.toLocaleString(undefined, { maximumFractionDigits: decimals }))
      return
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        setDisplay(
          v.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        )
      },
    })
    return () => controls.stop()
  }, [inView, value, decimals, reduce])

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  )
}

const STATS = [
  { value: 3400, suffix: '+', label: 'Organizations', decimals: 0 },
  { value: 680, suffix: 'K+', label: 'Employees managed', decimals: 0 },
  { value: 99.9, suffix: '%', label: 'Uptime SLA', decimals: 1 },
  { value: 4.9, suffix: '/5', label: 'Average rating', decimals: 1 },
]

export default function StatsBand() {
  return (
    <section className="bg-canvas py-16 sm:py-20">
      <Container>
        <Reveal>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <dd className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </dd>
                <dt className="mt-2 text-sm font-medium text-slate-500">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  )
}
