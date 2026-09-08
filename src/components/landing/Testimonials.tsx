import { IconStar } from '@tabler/icons-react'
import { Avatar, Container, SectionHeading } from './primitives'

const TESTIMONIALS = [
  {
    name: 'Ada Obi',
    role: 'VP of People, Brightpath',
    quote:
      'We onboarded six new entities onto CultureSync in a single afternoon. Our support ticket volume for HR tools basically disappeared.',
  },
  {
    name: 'Tunde Bakare',
    role: 'Head of People Ops, Vantage Labs',
    quote:
      'The onboarding wizard is the reason we chose it. Each company got its own workspace, configured before the first employee even logged in.',
  },
  {
    name: 'Lena Park',
    role: 'HR Director, Orbital',
    quote:
      'Appraisals used to take us two months on spreadsheets. CultureSync cut that to two weeks — and our managers actually enjoy doing them now.',
  },
  {
    name: 'Kofi Mensah',
    role: 'CHRO, Northwind',
    quote:
      'Leave, goals, performance, analytics — finally one place. Our data was siloed across four tools before this.',
  },
  {
    name: 'Chioma Eze',
    role: 'People Lead, Atlas Group',
    quote:
      'The multi-tenant setup is seamless. We manage 14 subsidiaries and each one gets its own policies and permissions. It just works.',
  },
  {
    name: 'Sam Idris',
    role: 'HR Operations, Summit & Co',
    quote:
      'Bulk inviting 300 employees took one CSV upload. The guided first-day experience made everyone feel welcome instantly.',
  },
]

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <figure className="flex w-[320px] shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:w-[380px]">
      <div>
        <div className="flex gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <IconStar key={i} className="size-4 fill-current" aria-hidden="true" />
          ))}
        </div>
        <blockquote className="mt-4 text-[15px] leading-relaxed text-slate-700">
          “{t.quote}”
        </blockquote>
      </div>
      <figcaption className="mt-6 flex items-center gap-3">
        <Avatar name={t.name} />
        <div>
          <p className="text-sm font-semibold text-slate-900">{t.name}</p>
          <p className="text-xs text-slate-500">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  )
}

export default function Testimonials() {
  return (
    <section className="overflow-hidden bg-canvas py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title="Teams love CultureSync."
          description="Real stories from HR teams who made the move — and never looked back."
        />
      </Container>

      <div className="mask-fade-x mt-14 space-y-5 overflow-hidden">
        <div className="flex w-max animate-marquee-slow gap-5 pr-5 hover:[animation-play-state:paused]">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <TestimonialCard key={`${t.name}-${i}`} t={t} />
          ))}
        </div>
        <div className="flex w-max animate-marquee gap-5 pr-5 hover:[animation-play-state:paused] [animation-direction:reverse]">
          {[...TESTIMONIALS, ...TESTIMONIALS]
            .slice()
            .reverse()
            .map((t, i) => (
              <TestimonialCard key={`${t.name}-rev-${i}`} t={t} />
            ))}
        </div>
      </div>
    </section>
  )
}
