import type { ComponentType } from 'react'
import {
  IconBuilding,
  IconUsersGroup,
  IconBriefcase,
  IconFileImport,
  IconMail,
  IconSettings,
  IconCircleCheck,
} from '@tabler/icons-react'

export interface OnboardingStep {
  id: string
  path: string
  number: number
  title: string
  subtitle: string
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'organization',
    path: '/onboarding/organization',
    number: 1,
    title: 'Organization',
    subtitle: 'Company profile',
    Icon: IconBuilding,
  },
  {
    id: 'departments',
    path: '/onboarding/departments',
    number: 2,
    title: 'Departments',
    subtitle: 'Team structure',
    Icon: IconUsersGroup,
  },
  {
    id: 'job-titles',
    path: '/onboarding/job-titles',
    number: 3,
    title: 'Job Titles',
    subtitle: 'Role hierarchy',
    Icon: IconBriefcase,
  },
  {
    id: 'import',
    path: '/onboarding/import',
    number: 4,
    title: 'Employee Import',
    subtitle: 'Import roster',
    Icon: IconFileImport,
  },
  {
    id: 'invite',
    path: '/onboarding/invite',
    number: 5,
    title: 'Invite Team',
    subtitle: 'Send invitations',
    Icon: IconMail,
  },
  {
    id: 'hr-config',
    path: '/onboarding/hr-config',
    number: 6,
    title: 'HR Config',
    subtitle: 'Policies & settings',
    Icon: IconSettings,
  },
  {
    id: 'complete',
    path: '/onboarding/complete',
    number: 7,
    title: 'Complete',
    subtitle: "You're all set",
    Icon: IconCircleCheck,
  },
]

/** Index of the step matching a pathname, or 0 if unmatched. */
export function findStepIndex(pathname: string): number {
  const idx = ONBOARDING_STEPS.findIndex((s) => pathname === s.path)
  return idx === -1 ? 0 : idx
}
