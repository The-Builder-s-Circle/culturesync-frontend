import { motion, useReducedMotion } from 'motion/react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Container({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  )
}

const EASE = [0.21, 0.47, 0.32, 0.98] as const

export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, margin: '0px 0px -48px 0px' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-700',
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-indigo-500" />
      {children}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  dark = false,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'center' | 'left'
  dark?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow ? (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      ) : null}
      <Reveal delay={0.05}>
        <h2
          className={cn(
            'mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl',
            dark ? 'text-white' : 'text-slate-900'
          )}
        >
          {title}
        </h2>
      </Reveal>
      {description ? (
        <Reveal delay={0.1}>
          <p
            className={cn(
              'mt-4 text-base leading-relaxed sm:text-lg',
              dark ? 'text-slate-300' : 'text-slate-600'
            )}
          >
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  )
}

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-violet-100 text-violet-700',
]

export function Avatar({
  name,
  className,
  size = 'md',
}: {
  name: string
  className?: string
  size?: 'sm' | 'md'
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const hash = name
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-white',
        size === 'md' ? 'size-9 text-xs' : 'size-6 text-[10px]',
        color,
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
