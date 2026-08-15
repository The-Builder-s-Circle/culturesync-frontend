import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button, SelectDropdown, TextInput } from '../../components/ui'
import { StepFooter, StepHeader } from '../../components/onboarding'
import { IconPlus, IconTrash, IconMail } from '@tabler/icons-react'
import { useOnboarding, useAuth } from '../../store'
import { employeeApi, tenantApi } from '../../api'

interface PendingInvite {
  id: string
  email: string
  role: string
}

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'Admin' },
  { label: 'HR Manager', value: 'HR Manager' },
  { label: 'Manager', value: 'Manager' },
  { label: 'Employee', value: 'Employee' },
  { label: 'Viewer', value: 'Viewer' },
]

export default function InviteTeamPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tenantId, setTenantId, markStepComplete } = useOnboarding()

  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [draftEmail, setDraftEmail] = useState('')
  const [draftRole, setDraftRole] = useState('Admin')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddInvite = (e?: FormEvent) => {
    if (e) e.preventDefault()
    const email = draftEmail.trim()
    if (!email) return

    if (invites.some((inv) => inv.email.toLowerCase() === email.toLowerCase())) {
      setError('This email is already in your invite list.')
      return
    }

    setError(null)
    setInvites((prev) => [
      ...prev,
      {
        id: `inv-${Date.now()}`,
        email,
        role: draftRole,
      },
    ])
    setDraftEmail('')
  }

  const removeInvite = (id: string) => {
    setInvites((prev) => prev.filter((inv) => inv.id !== id))
  }

  const handleSkip = () => {
    markStepComplete('invite')
    navigate('/onboarding/hr-config')
  }

  const handleContinue = async () => {
    setError(null)

    if (invites.length === 0) {
      handleSkip()
      return
    }

    setIsSubmitting(true)
    try {
      let activeTenantId: string | null = tenantId || user?.tenantId || null
      if (!activeTenantId) {
        const lookup = await tenantApi.lookup()
        const lookupData = lookup.data as { tenantId?: string; id?: string } | undefined
        activeTenantId = lookupData?.tenantId || lookupData?.id || null
        if (activeTenantId) {
          setTenantId(activeTenantId)
        }
      }

      if (!activeTenantId) {
        throw new Error('Tenant identifier not found. Please complete previous setup steps.')
      }

      // Dispatch invite calls sequentially or concurrently
      for (const invite of invites) {
        await employeeApi.inviteEmployee(activeTenantId, {
          email: invite.email,
        })
      }

      markStepComplete('invite')
      navigate('/onboarding/hr-config')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to send invites. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Step Header */}
      <StepHeader
        title="Invite your team"
        description="Invite HR managers and admins who will help configure and manage CultureSync."
      />

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">
          {error}
        </div>
      )}

      {/* Invite Input Row Card */}
      <form
        onSubmit={handleAddInvite}
        className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row"
      >
        <div className="w-full sm:flex-1">
          <TextInput
            type="email"
            placeholder="colleague@company.com"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-44">
          <SelectDropdown
            options={ROLE_OPTIONS}
            value={draftRole}
            onChange={(e) => setDraftRole(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={!draftEmail.trim()}
          className="w-full shrink-0 sm:w-auto"
        >
          <IconPlus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </form>

      {/* Added Invites List */}
      {invites.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-700">
            Pending Invitations ({invites.length})
          </div>
          <div className="divide-y divide-slate-100 p-2">
            {invites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-2.5 transition-colors hover:bg-slate-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <IconMail className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{inv.email}</p>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {inv.role}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeInvite(inv.id)}
                  aria-label={`Remove invite for ${inv.email}`}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <IconTrash className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission Levels Legend Card */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-800">Permission levels</h3>

        <div className="mt-3.5 space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-purple-600" />
            <p className="text-slate-600">
              <strong className="font-semibold text-slate-900">Admin</strong> — Full access to all
              settings and data
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-indigo-600" />
            <p className="text-slate-600">
              <strong className="font-semibold text-slate-900">HR Manager</strong> — Manage
              employees, run reports, configure HR policies
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-sky-600" />
            <p className="text-slate-600">
              <strong className="font-semibold text-slate-900">Manager</strong> — View and manage
              their direct reports
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-600" />
            <p className="text-slate-600">
              <strong className="font-semibold text-slate-900">Employee</strong> — Self-service:
              view payslips, request leave, update profile
            </p>
          </div>
        </div>
      </div>

      {/* Step Footer with Skip Option */}
      <StepFooter
        backTo="/onboarding/import"
        onContinue={handleContinue}
        onSkip={handleSkip}
        isLoading={isSubmitting}
      />
    </div>
  )
}
