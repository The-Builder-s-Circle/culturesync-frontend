import { useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button, SelectDropdown, TextInput } from '../../components/ui'
import { StepFooter, StepHeader } from '../../components/onboarding'
import { IconPlus, IconTrash, IconMail, IconCheck, IconLoader2 } from '@tabler/icons-react'
import { useOnboarding, useAuth } from '../../store'
import { employeeApi, tenantApi, roleApi } from '../../api'
import type { RoleDto } from '../../api'

type InviteStatus = 'pending' | 'sending' | 'sent' | 'error'

interface PendingInvite {
  id: string
  email: string
  roleName: string
  roleId?: string
  status: InviteStatus
  errorMessage?: string
}

const LEGEND_COLORS = ['bg-purple-600', 'bg-indigo-600', 'bg-sky-600', 'bg-emerald-600']

export default function InviteTeamPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { tenantId, setTenantId, markStepComplete, skipStep } = useOnboarding()

  const [availableRoles, setAvailableRoles] = useState<RoleDto[]>([])
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([])
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [draftEmail, setDraftEmail] = useState('')
  const [draftRoleValue, setDraftRoleValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const allSent = invites.length > 0 && invites.every((inv) => inv.status === 'sent')

  useEffect(() => {
    let ignore = false
    const fetchRoles = async () => {
      try {
        const res = await roleApi.getRoles()
        if (!ignore && (res.isSuccess || res.succeeded) && Array.isArray(res.data)) {
          const options = res.data.map((r) => ({
            label: r.name,
            value: r.id || r.name,
          }))
          setAvailableRoles(res.data)
          setRoleOptions(options)
          setDraftRoleValue(options[0]?.value ?? '')
        }
      } catch (err) {
        if (!ignore) {
          console.warn('Could not fetch roles from /api/Role/list:', err)
          setError('Could not load roles from the server. Please refresh the page to try again.')
        }
      }
    }
    fetchRoles()
    return () => {
      ignore = true
    }
  }, [])

  const resolveTenantId = useCallback(async (): Promise<string | null> => {
    let activeTenantId = tenantId || user?.tenantId || null
    if (!activeTenantId) {
      activeTenantId = await tenantApi.resolveActiveTenantId()
      if (activeTenantId) {
        setTenantId(activeTenantId)
      }
    }
    return activeTenantId
  }, [tenantId, user?.tenantId, setTenantId])

  const handleAddInvite = (e?: FormEvent) => {
    if (e) e.preventDefault()
    const email = draftEmail.trim()
    if (!email) return

    if (invites.some((inv) => inv.email.toLowerCase() === email.toLowerCase())) {
      setError('This email is already in your invite list.')
      return
    }

    const matchedRole = availableRoles.find(
      (r) => r.id === draftRoleValue || r.name.toLowerCase() === draftRoleValue.toLowerCase()
    )
    const selectedOption = roleOptions.find((opt) => opt.value === draftRoleValue)

    const roleName = matchedRole?.name || selectedOption?.label || draftRoleValue
    const roleId = matchedRole?.id

    setError(null)
    setInvites((prev) => [
      ...prev,
      {
        id: `inv-${Date.now()}`,
        email,
        roleName,
        roleId,
        status: 'pending' as const,
      },
    ])
    setDraftEmail('')
  }

  const removeInvite = (id: string) => {
    setInvites((prev) => prev.filter((inv) => inv.id !== id))
  }

  const sendInvite = useCallback(
    async (inviteId: string) => {
      const invite = invites.find((inv) => inv.id === inviteId)
      if (!invite || invite.status === 'sending' || invite.status === 'sent') return

      setInvites((prev) =>
        prev.map((inv) => (inv.id === inviteId ? { ...inv, status: 'sending' as const } : inv))
      )

      try {
        const activeTenantId = await resolveTenantId()
        if (!activeTenantId) {
          throw new Error('Tenant identifier not found. Please complete previous setup steps.')
        }

        const res = await employeeApi.inviteEmployee(activeTenantId, {
          email: invite.email,
          roleId: invite.roleId,
        })

        if (res.isSuccess || res.succeeded) {
          setInvites((prev) =>
            prev.map((inv) =>
              inv.id === inviteId ? { ...inv, status: 'sent' as const, errorMessage: undefined } : inv
            )
          )
        } else {
          const msg = res.message || 'Failed to send invite.'
          setInvites((prev) =>
            prev.map((inv) =>
              inv.id === inviteId
                ? { ...inv, status: 'error' as const, errorMessage: msg }
                : inv
            )
          )
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to send invite.'
        setInvites((prev) =>
          prev.map((inv) =>
            inv.id === inviteId
              ? { ...inv, status: 'error' as const, errorMessage: msg }
              : inv
          )
        )
      }
    },
    [invites, resolveTenantId]
  )

  const handleSkip = () => {
    skipStep('invite')
    navigate('/onboarding/hr-config')
  }

  const handleContinue = () => {
    markStepComplete('invite')
    navigate('/onboarding/hr-config')
  }

  return (
    <div>
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
        <div className="w-full sm:flex-[2]">
          <TextInput
            type="email"
            placeholder="colleague@company.com"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            className="h-11 text-sm"
          />
        </div>

        <div className="w-full sm:w-44">
          <SelectDropdown
            placeholder={roleOptions.length > 0 ? 'Select a role' : 'Loading roles...'}
            options={roleOptions}
            value={draftRoleValue}
            onChange={(e) => setDraftRoleValue(e.target.value)}
            disabled={roleOptions.length === 0}
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
                className="flex items-center justify-between gap-3 p-2.5 transition-colors hover:bg-slate-50/60"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <IconMail className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{inv.email}</p>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {inv.roleName}
                    </span>
                    {inv.errorMessage && (
                      <p className="mt-1 text-xs text-red-600">{inv.errorMessage}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {inv.status === 'sent' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <IconCheck className="size-3.5" aria-hidden="true" />
                      Invited
                    </span>
                  ) : inv.status === 'sending' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                      <IconLoader2 className="size-3.5 animate-spin" aria-hidden="true" />
                      Sending
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => sendInvite(inv.id)}
                      className="text-xs"
                    >
                      {inv.status === 'error' ? 'Retry' : 'Invite'}
                    </Button>
                  )}

                  {inv.status !== 'sending' && (
                    <button
                      type="button"
                      onClick={() => removeInvite(inv.id)}
                      aria-label={`Remove invite for ${inv.email}`}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <IconTrash className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission Levels Legend Card */}
      {availableRoles.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-800">Permission levels</h3>
          <div className="mt-3.5 space-y-2.5 text-xs">
            {availableRoles.map((role, index) => (
              <div key={role.id || role.name} className="flex items-start gap-2.5">
                <span
                  className={`mt-1 size-2 shrink-0 rounded-full ${
                    LEGEND_COLORS[index % LEGEND_COLORS.length]
                  }`}
                />
                <p className="text-slate-600">
                  <strong className="font-semibold text-slate-900">{role.name}</strong>
                  {role.description ? ` — ${role.description}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <StepFooter
        backTo="/onboarding/import"
        onContinue={handleContinue}
        onSkip={handleSkip}
        continueDisabled={!allSent}
      />
    </div>
  )
}
