import { Container, SectionHeading } from './primitives'

const SCENARIOS = [
  {
    label: 'Multi-entity groups',
    quote:
      'Onboard six new entities in a single afternoon. Each company gets its own workspace, configured before the first employee logs in.',
  },
  {
    label: 'Guided onboarding',
    quote:
      'Invite everyone with one CSV upload. New joiners get a personalized welcome and a guided first day, instead of a blank spreadsheet.',
  },
  {
    label: 'Performance reviews',
    quote:
      'Run appraisals on a schedule instead of spreadsheets. Managers get a guided flow they can actually finish on time.',
  },
  {
    label: 'One workspace',
    quote:
      'Leave, goals, appraisals, and analytics in one place, with policies and permissions set once per company.',
  },
  {
    label: 'Subsidiaries',
    quote:
      'Manage multiple entities under one platform, each with its own policies and permissions. One login, no duplicated spreadsheets.',
  },
  {
    label: 'People analytics',
    quote:
      'Headcount, leave, and performance in one view, so reporting takes minutes instead of a week of spreadsheet wrangling.',
  },
]

function ScenarioCard({ s }: { s: (typeof SCENARIOS)[number] }) {
  return (
    <figure className="flex w-[320px] shrink-0 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:w-[380px]">
      <blockquote className="text-[15px] leading-relaxed text-slate-700">
        “{s.quote}”
      </blockquote>
      <figcaption className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          {s.label}
        </p>
      </figcaption>
    </figure>
  )
}

export default function RolloutScenarios() {
  return (
    <section className="overflow-hidden bg-canvas py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Use cases"
          title="What a rollout looks like."
          description="The workflows CultureSync supports, from first invite to first appraisal."
        />
      </Container>

      <div className="mask-fade-x mt-14 space-y-5 overflow-hidden">
        <div className="flex w-max animate-marquee-slow gap-5 pr-5 hover:[animation-play-state:paused]">
          {[...SCENARIOS, ...SCENARIOS].map((s, i) => (
            <ScenarioCard key={`${s.label}-${i}`} s={s} />
          ))}
        </div>
        <div className="flex w-max animate-marquee gap-5 pr-5 hover:[animation-play-state:paused] [animation-direction:reverse]">
          {[...SCENARIOS, ...SCENARIOS]
            .slice()
            .reverse()
            .map((s, i) => (
              <ScenarioCard key={`${s.label}-rev-${i}`} s={s} />
            ))}
        </div>
      </div>
    </section>
  )
}
