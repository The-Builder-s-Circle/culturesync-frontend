import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { IconArrowRight, IconMenu, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/cn'
import { Container } from './primitives'
import { Button } from '../ui'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

import { Logo } from '../ui'

export function BrandMark({ className }: { className?: string }) {
  return <Logo className={className} />
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-slate-200/80 bg-white/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <BrandMark />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Sign in
          </Link>
          <Link to="/login">
            <Button size="sm" className="px-4">
              Start free
              <IconArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? (
            <IconX className="size-5" aria-hidden="true" />
          ) : (
            <IconMenu className="size-5" aria-hidden="true" />
          )}
        </button>
      </Container>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-b border-slate-200 bg-white lg:hidden"
            aria-label="Mobile"
          >
            <div className="space-y-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3">
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button className="w-full">
                    Start free
                    <IconArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
