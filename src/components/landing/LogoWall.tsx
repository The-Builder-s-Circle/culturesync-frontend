import {
  IconBuildingBank,
  IconBuildingCommunity,
  IconHexagon,
  IconLeaf,
  IconPlanet,
  IconRocket,
  IconShieldLock,
  IconSphere,
  IconSun,
  IconWorld,
} from '@tabler/icons-react'
import { Container, Reveal } from './primitives'

const COMPANIES = [
  { name: 'Northwind', Icon: IconBuildingCommunity },
  { name: 'Vantage Labs', Icon: IconRocket },
  { name: 'Brightpath', Icon: IconSun },
  { name: 'Orbital', Icon: IconPlanet },
  { name: 'Summit & Co', Icon: IconBuildingBank },
  { name: 'Evergreen', Icon: IconLeaf },
  { name: 'Hexad', Icon: IconHexagon },
  { name: 'Fortress', Icon: IconShieldLock },
  { name: 'Atlas Group', Icon: IconWorld },
  { name: 'Nimbus', Icon: IconSphere },
]

export default function LogoWall() {
  return (
    <section className="border-y border-slate-200/70 bg-white py-12">
      <Container>
        <Reveal>
          <p className="text-center text-sm font-medium text-slate-500">
            Powering HR at 3,400+ organizations, including
          </p>
        </Reveal>
      </Container>
      <Reveal delay={0.1}>
        <div className="mask-fade-x mt-8 overflow-hidden">
          <div className="flex w-max animate-marquee gap-14 pr-14 hover:[animation-play-state:paused]">
            {[...COMPANIES, ...COMPANIES].map(({ name, Icon }, i) => (
              <div
                key={`${name}-${i}`}
                className="flex shrink-0 items-center gap-2 text-slate-400 transition-colors hover:text-slate-600"
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
