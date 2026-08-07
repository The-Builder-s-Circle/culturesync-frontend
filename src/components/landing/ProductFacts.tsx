import {
  IconBuilding,
  IconFileUpload,
  IconLayoutGrid,
  IconUsers,
} from '@tabler/icons-react'
import { Container, Reveal } from './primitives'

const FACTS = [
  { Icon: IconUsers, value: '25', label: 'people, free forever' },
  { Icon: IconBuilding, value: '1', label: 'workspace per company' },
  { Icon: IconFileUpload, value: 'CSV', label: 'bulk invite in one upload' },
  { Icon: IconLayoutGrid, value: '4', label: 'modules: leave, goals, appraisals, analytics' },
]

export default function ProductFacts() {
  return (
    <section className="bg-canvas py-16 sm:py-20">
      <Container>
        <Reveal>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {FACTS.map(({ Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon
                  className="mx-auto size-6 text-indigo-600"
                  aria-hidden="true"
                />
                <dd className="mt-3 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                  {value}
                </dd>
                <dt className="mt-2 text-sm font-medium text-slate-500">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  )
}
