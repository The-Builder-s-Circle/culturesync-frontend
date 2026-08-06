import {
  IconBuildingBank,
  IconBuildingCommunity,
  IconCalculator,
  IconCode,
  IconHeart,
  IconHospital,
  IconSchool,
  IconShoppingCart,
  IconTruck,
  IconUserShield,
} from '@tabler/icons-react'
import { Container, Reveal } from './primitives'

const INDUSTRIES = [
  { name: 'HR & People Ops', Icon: IconUserShield },
  { name: 'Operations', Icon: IconBuildingCommunity },
  { name: 'Engineering', Icon: IconCode },
  { name: 'Finance', Icon: IconCalculator },
  { name: 'Retail', Icon: IconShoppingCart },
  { name: 'Healthcare', Icon: IconHospital },
  { name: 'Education', Icon: IconSchool },
  { name: 'Agencies', Icon: IconHeart },
  { name: 'Logistics', Icon: IconTruck },
  { name: 'Enterprise', Icon: IconBuildingBank },
]

export default function Industries() {
  return (
    <section className="border-y border-slate-200/70 bg-white py-12">
      <Container>
        <Reveal>
          <p className="text-center text-sm font-medium text-slate-500">
            Built for every team. One workspace per company.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4">
            {INDUSTRIES.map(({ name, Icon }) => (
              <li
                key={name}
                className="flex items-center gap-2 text-slate-500"
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}
